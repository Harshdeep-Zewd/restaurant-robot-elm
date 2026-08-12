import { Router } from 'express';
import { db } from '../db/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure Multer for file storage
const uploadDir = path.join(__dirname, '../../storage/artifacts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

// --- PROJECTS & TRACKERS ---
router.get('/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects').all();
  res.json(projects);
});

router.get('/projects/:projectId/trackers', (req, res) => {
  const trackers = db.prepare(`
    SELECT t.*, 
      (SELECT COUNT(*) FROM engineering_objects eo WHERE eo.tracker_id = t.id) as object_count
    FROM trackers t 
    WHERE t.project_id = ?
  `).all(req.params.projectId);
  res.json(trackers);
});

router.get('/trackers/:trackerId/folders', (req, res) => {
  const folders = db.prepare('SELECT * FROM folders WHERE tracker_id = ? ORDER BY position ASC').all(req.params.trackerId);
  res.json(folders);
});

router.get('/trackers/:trackerId/objects', (req, res) => {
  const { folderId, search, status, priority } = req.query;
  let query = `
    SELECT eo.*, u.name as owner_name, f.name as folder_name
    FROM engineering_objects eo
    LEFT JOIN users u ON eo.owner_id = u.id
    LEFT JOIN folders f ON eo.folder_id = f.id
    WHERE eo.tracker_id = ?
  `;
  const params: any[] = [req.params.trackerId];

  if (folderId) {
    query += ' AND eo.folder_id = ?';
    params.push(folderId);
  }
  if (status) {
    query += ' AND eo.status = ?';
    params.push(status);
  }
  if (priority) {
    query += ' AND eo.priority = ?';
    params.push(priority);
  }
  if (search) {
    query += ' AND (eo.object_key LIKE ? OR eo.title LIKE ? OR eo.description LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  query += ' ORDER BY eo.id DESC';
  const objects = db.prepare(query).all(...params);
  res.json(objects);
});

// --- ENGINEERING OBJECT DETAIL, CREATE & UPDATE ---
router.get('/objects/:id', (req, res) => {
  const object = db.prepare(`
    SELECT eo.*, u.name as owner_name, t.key as tracker_key, t.name as tracker_name, t.type as tracker_type
    FROM engineering_objects eo
    LEFT JOIN users u ON eo.owner_id = u.id
    LEFT JOIN trackers t ON eo.tracker_id = t.id
    WHERE eo.id = ?
  `).get(req.params.id);

  if (!object) {
    return res.status(404).json({ error: 'Object not found' });
  }

  // Fetch relationships
  const outgoingRels = db.prepare(`
    SELECT r.*, target.object_key as target_key, target.title as target_title, target.type as target_type
    FROM relationships r
    JOIN engineering_objects target ON r.target_id = target.id
    WHERE r.source_id = ?
  `).all(req.params.id);

  const incomingRels = db.prepare(`
    SELECT r.*, source.object_key as source_key, source.title as source_title, source.type as source_type
    FROM relationships r
    JOIN engineering_objects source ON r.source_id = source.id
    WHERE r.target_id = ?
  `).all(req.params.id);

  // Fetch version history
  const versions = db.prepare(`
    SELECT ov.*, u.name as author_name
    FROM object_versions ov
    LEFT JOIN users u ON ov.author_id = u.id
    WHERE ov.object_id = ?
    ORDER BY ov.version DESC
  `).all(req.params.id);

  // Fetch test steps if Test Case
  const testSteps = db.prepare('SELECT * FROM test_steps WHERE test_case_id = ? ORDER BY step_number ASC').all(req.params.id);

  // Fetch attachments
  const attachments = db.prepare('SELECT * FROM artifacts WHERE object_id = ?').all(req.params.id);

  res.json({
    ...object,
    metadata: JSON.parse((object as any).metadata_json || '{}'),
    outgoingRelationships: outgoingRels,
    incomingRelationships: incomingRels,
    versions: versions.map((v: any) => ({ ...v, metadata: JSON.parse(v.metadata_json || '{}') })),
    testSteps,
    attachments
  });
});

router.post('/objects', (req, res) => {
  const { tracker_id, folder_id, title, description, priority, owner_id, metadata } = req.body;
  
  const tracker = db.prepare('SELECT * FROM trackers WHERE id = ?').get(tracker_id) as any;
  if (!tracker) {
    return res.status(400).json({ error: 'Invalid tracker ID' });
  }

  const count = (db.prepare('SELECT COUNT(*) as count FROM engineering_objects WHERE tracker_id = ?').get(tracker_id) as any).count;
  const object_key = `${tracker.prefix}${String(count + 1).padStart(3, '0')}`;

  const result = db.prepare(`
    INSERT INTO engineering_objects (tracker_id, folder_id, object_key, title, description, type, status, priority, owner_id, version, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, 1, ?)
  `).run(tracker_id, folder_id || null, object_key, title, description || '', tracker.type, priority || 'MEDIUM', owner_id || 1, JSON.stringify(metadata || {}));

  const objectId = Number(result.lastInsertRowid);

  // Log audit & create initial version snapshot
  db.prepare(`
    INSERT INTO object_versions (object_id, version, title, description, status, metadata_json, changed_fields, change_reason, author_id)
    VALUES (?, 1, ?, ?, 'DRAFT', ?, '[]', 'Initial object creation', ?)
  `).run(objectId, title, description || '', JSON.stringify(metadata || {}), owner_id || 1);

  db.prepare(`
    INSERT INTO audit_logs (project_id, user_id, action, entity_type, entity_id, details_json)
    VALUES (?, ?, 'CREATE', ?, ?, ?)
  `).run(tracker.project_id, owner_id || 1, tracker.type, objectId, JSON.stringify({ key: object_key, title }));

  res.json({ id: objectId, object_key });
});

router.put('/objects/:id', (req, res) => {
  const { title, description, status, priority, owner_id, metadata, change_reason } = req.body;

  const currentObj = db.prepare('SELECT * FROM engineering_objects WHERE id = ?').get(req.params.id) as any;
  if (!currentObj) {
    return res.status(404).json({ error: 'Object not found' });
  }

  const newVersion = currentObj.version + 1;
  const tracker = db.prepare('SELECT project_id FROM trackers WHERE id = ?').get(currentObj.tracker_id) as any;

  db.prepare(`
    UPDATE engineering_objects
    SET title = ?, description = ?, status = ?, priority = ?, owner_id = ?, version = ?, metadata_json = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title || currentObj.title,
    description !== undefined ? description : currentObj.description,
    status || currentObj.status,
    priority || currentObj.priority,
    owner_id || currentObj.owner_id,
    newVersion,
    JSON.stringify(metadata || JSON.parse(currentObj.metadata_json || '{}')),
    req.params.id
  );

  // Record version snapshot
  db.prepare(`
    INSERT INTO object_versions (object_id, version, title, description, status, metadata_json, changed_fields, change_reason, author_id)
    VALUES (?, ?, ?, ?, ?, ?, '["title", "description", "status", "metadata"]', ?, ?)
  `).run(
    req.params.id,
    newVersion,
    title || currentObj.title,
    description !== undefined ? description : currentObj.description,
    status || currentObj.status,
    JSON.stringify(metadata || JSON.parse(currentObj.metadata_json || '{}')),
    change_reason || 'Updated object details',
    owner_id || 1
  );

  db.prepare(`
    INSERT INTO audit_logs (project_id, user_id, action, entity_type, entity_id, details_json)
    VALUES (?, ?, 'UPDATE', ?, ?, ?)
  `).run(tracker.project_id, owner_id || 1, currentObj.type, req.params.id, JSON.stringify({ key: currentObj.object_key, newVersion }));

  res.json({ success: true, version: newVersion });
});

// --- TRACEABILITY ENGINE & MATRIX ---
router.get('/traceability/matrix', (req, res) => {
  const { sourceTrackerId, targetTrackerId } = req.query;

  const sources = db.prepare('SELECT id, object_key, title, status FROM engineering_objects WHERE tracker_id = ?').all(sourceTrackerId);
  const targets = db.prepare('SELECT id, object_key, title, status FROM engineering_objects WHERE tracker_id = ?').all(targetTrackerId);

  const links = db.prepare(`
    SELECT r.source_id, r.target_id, r.relationship_type
    FROM relationships r
    JOIN engineering_objects s ON r.source_id = s.id
    JOIN engineering_objects t ON r.target_id = t.id
    WHERE s.tracker_id = ? AND t.tracker_id = ?
  `).all(sourceTrackerId, targetTrackerId);

  res.json({ sources, targets, links });
});

router.get('/traceability/coverage', (req, res) => {
  const { projectId } = req.query;

  // Unverified requirements (Requirements without VERIFIED_BY test case)
  const unverifiedReqs = db.prepare(`
    SELECT eo.id, eo.object_key, eo.title
    FROM engineering_objects eo
    JOIN trackers t ON eo.tracker_id = t.id
    WHERE t.project_id = ? AND t.type = 'REQUIREMENT'
    AND eo.id NOT IN (
      SELECT r.source_id FROM relationships r WHERE r.relationship_type = 'VERIFIED_BY'
    )
  `).all(projectId);

  // Tests without requirement links
  const orphanTests = db.prepare(`
    SELECT eo.id, eo.object_key, eo.title
    FROM engineering_objects eo
    JOIN trackers t ON eo.tracker_id = t.id
    WHERE t.project_id = ? AND t.type = 'TEST_CASE'
    AND eo.id NOT IN (
      SELECT r.target_id FROM relationships r WHERE r.relationship_type = 'VERIFIED_BY'
    )
  `).all(projectId);

  // Risks without mitigations
  const unmitigatedRisks = db.prepare(`
    SELECT eo.id, eo.object_key, eo.title
    FROM engineering_objects eo
    JOIN trackers t ON eo.tracker_id = t.id
    WHERE t.project_id = ? AND t.type = 'RISK'
    AND eo.id NOT IN (
      SELECT r.source_id FROM relationships r WHERE r.relationship_type = 'MITIGATED_BY'
    )
  `).all(projectId);

  res.json({
    unverifiedRequirements: unverifiedReqs,
    orphanTests,
    unmitigatedRisks,
    stats: {
      unverifiedCount: unverifiedReqs.length,
      orphanTestCount: orphanTests.length,
      unmitigatedRiskCount: unmitigatedRisks.length
    }
  });
});

router.get('/traceability/impact/:objectId', (req, res) => {
  const objectId = req.params.objectId;
  const rootObject = db.prepare('SELECT id, object_key, title, type, status FROM engineering_objects WHERE id = ?').get(objectId);

  if (!rootObject) return res.status(404).json({ error: 'Object not found' });

  // Transitive forward & backward impact links
  const impactedDownstream = db.prepare(`
    SELECT r.relationship_type, target.id, target.object_key, target.title, target.type, target.status
    FROM relationships r
    JOIN engineering_objects target ON r.target_id = target.id
    WHERE r.source_id = ?
  `).all(objectId);

  const impactedUpstream = db.prepare(`
    SELECT r.relationship_type, source.id, source.object_key, source.title, source.type, source.status
    FROM relationships r
    JOIN engineering_objects source ON r.source_id = source.id
    WHERE r.target_id = ?
  `).all(objectId);

  res.json({
    root: rootObject,
    downstreamImpact: impactedDownstream,
    upstreamImpact: impactedUpstream
  });
});

router.post('/relationships', (req, res) => {
  const { source_id, target_id, relationship_type, created_by } = req.body;

  const result = db.prepare(`
    INSERT INTO relationships (source_id, target_id, relationship_type, created_by)
    VALUES (?, ?, ?, ?)
  `).run(source_id, target_id, relationship_type, created_by || 1);

  res.json({ success: true, id: result.lastInsertRowid });
});

router.delete('/relationships/:id', (req, res) => {
  db.prepare('DELETE FROM relationships WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- TESTING MODULE (TEST CASES, SETS, CONFIGS, RUNS & RUNNER) ---
router.get('/tests/sets', (req, res) => {
  const testSets = db.prepare(`
    SELECT eo.*, 
      (SELECT COUNT(*) FROM test_set_items tsi WHERE tsi.test_set_id = eo.id) as case_count
    FROM engineering_objects eo
    JOIN trackers t ON eo.tracker_id = t.id
    WHERE t.type = 'TEST_SET'
  `).all();
  res.json(testSets);
});

router.get('/tests/configs', (req, res) => {
  const configs = db.prepare('SELECT * FROM test_configs ORDER BY id DESC').all();
  res.json(configs);
});

router.post('/tests/configs', (req, res) => {
  const { project_id, name, software_version, firmware_version, hardware_revision, sensor_config, parameter_config, battery_config, environment_config } = req.body;
  const result = db.prepare(`
    INSERT INTO test_configs (project_id, name, software_version, firmware_version, hardware_revision, sensor_config, parameter_config, battery_config, environment_config)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(project_id || 1, name, software_version, firmware_version, hardware_revision, sensor_config || '', parameter_config || '', battery_config || '', environment_config || '');

  res.json({ success: true, id: result.lastInsertRowid });
});

router.get('/tests/runs', (req, res) => {
  const runs = db.prepare(`
    SELECT tr.*, 
      ts_obj.object_key as test_set_key, ts_obj.title as test_set_title,
      tc.name as config_name, tc.software_version, tc.firmware_version, tc.hardware_revision,
      u.name as tester_name
    FROM test_runs tr
    JOIN engineering_objects ts_obj ON tr.test_set_id = ts_obj.id
    JOIN test_configs tc ON tr.test_config_id = tc.id
    LEFT JOIN users u ON tr.executed_by = u.id
    ORDER BY tr.id DESC
  `).all();
  res.json(runs);
});

router.get('/tests/runs/:id', (req, res) => {
  const run = db.prepare(`
    SELECT tr.*, 
      ts_obj.object_key as test_set_key, ts_obj.title as test_set_title,
      tc.name as config_name, tc.software_version, tc.firmware_version, tc.hardware_revision, tc.sensor_config,
      u.name as tester_name
    FROM test_runs tr
    JOIN engineering_objects ts_obj ON tr.test_set_id = ts_obj.id
    JOIN test_configs tc ON tr.test_config_id = tc.id
    LEFT JOIN users u ON tr.executed_by = u.id
    WHERE tr.id = ?
  `).get(req.params.id);

  if (!run) return res.status(404).json({ error: 'Test run not found' });

  // Get test case results in run
  const caseResults = db.prepare(`
    SELECT trr.*, tc_obj.object_key as case_key, tc_obj.title as case_title, tc_obj.priority
    FROM test_run_results trr
    JOIN engineering_objects tc_obj ON trr.test_case_id = tc_obj.id
    WHERE trr.test_run_id = ?
  `).all(req.params.id);

  // Attach step results for each case
  const fullCaseResults = caseResults.map((cr: any) => {
    const steps = db.prepare(`
      SELECT tsr.*, ts.step_number, ts.action, ts.expected_result
      FROM test_step_results tsr
      JOIN test_steps ts ON tsr.test_step_id = ts.id
      WHERE tsr.test_run_result_id = ?
      ORDER BY ts.step_number ASC
    `).all(cr.id);
    return { ...cr, steps };
  });

  res.json({ ...run, caseResults: fullCaseResults });
});

router.post('/tests/runs', (req, res) => {
  const { project_id, test_set_id, test_config_id, name, executed_by, notes } = req.body;

  const runResult = db.prepare(`
    INSERT INTO test_runs (project_id, test_set_id, test_config_id, name, overall_status, executed_by, started_at, notes)
    VALUES (?, ?, ?, ?, 'IN_PROGRESS', ?, CURRENT_TIMESTAMP, ?)
  `).run(project_id || 1, test_set_id, test_config_id, name, executed_by || 1, notes || '');

  const runId = Number(runResult.lastInsertRowid);

  // Populate test cases from test set
  const setCases = db.prepare('SELECT test_case_id FROM test_set_items WHERE test_set_id = ? ORDER BY position ASC').all(test_set_id);

  for (const sc of setCases as any[]) {
    const caseRes = db.prepare(`
      INSERT INTO test_run_results (test_run_id, test_case_id, status)
      VALUES (?, ?, 'NOT_RUN')
    `).run(runId, sc.test_case_id);

    const caseResId = Number(caseRes.lastInsertRowid);

    // Populate steps for case
    const steps = db.prepare('SELECT id FROM test_steps WHERE test_case_id = ? ORDER BY step_number ASC').all(sc.test_case_id);
    for (const step of steps as any[]) {
      db.prepare(`
        INSERT INTO test_step_results (test_run_result_id, test_step_id, status)
        VALUES (?, ?, 'NOT_RUN')
      `).run(caseResId, step.id);
    }
  }

  res.json({ success: true, id: runId });
});

router.put('/tests/runs/:runId/step-result', (req, res) => {
  const { test_step_result_id, status, actual_result, notes } = req.body;

  db.prepare(`
    UPDATE test_step_results
    SET status = ?, actual_result = ?, notes = ?
    WHERE id = ?
  `).run(status, actual_result || '', notes || '', test_step_result_id);

  // Recalculate test_run_result & test_run overall status
  const stepRes = db.prepare('SELECT test_run_result_id FROM test_step_results WHERE id = ?').get(test_step_result_id) as any;
  if (stepRes) {
    const allSteps = db.prepare('SELECT status FROM test_step_results WHERE test_run_result_id = ?').all(stepRes.test_run_result_id) as any[];
    let caseStatus = 'PASS';
    if (allSteps.some(s => s.status === 'FAIL')) caseStatus = 'FAIL';
    else if (allSteps.some(s => s.status === 'BLOCKED')) caseStatus = 'BLOCKED';
    else if (allSteps.some(s => s.status === 'NOT_RUN')) caseStatus = 'IN_PROGRESS';

    db.prepare('UPDATE test_run_results SET status = ?, executed_at = CURRENT_TIMESTAMP WHERE id = ?').run(caseStatus, stepRes.test_run_result_id);
  }

  res.json({ success: true });
});

// --- CHANGE REQUESTS & BASELINES ---
router.get('/changes', (req, res) => {
  const changes = db.prepare(`
    SELECT cr.*, u.name as author_name,
      (SELECT COUNT(*) FROM change_request_items cri WHERE cri.change_request_id = cr.id) as item_count
    FROM change_requests cr
    LEFT JOIN users u ON cr.author_id = u.id
    ORDER BY cr.id DESC
  `).all();
  res.json(changes);
});

router.get('/baselines', (req, res) => {
  const baselines = db.prepare(`
    SELECT b.*, u.name as author_name,
      (SELECT COUNT(*) FROM baseline_items bi WHERE bi.baseline_id = b.id) as item_count
    FROM baselines b
    LEFT JOIN users u ON b.created_by = u.id
    ORDER BY b.id DESC
  `).all();
  res.json(baselines);
});

router.get('/baselines/:id', (req, res) => {
  const baseline = db.prepare(`
    SELECT b.*, u.name as author_name
    FROM baselines b
    LEFT JOIN users u ON b.created_by = u.id
    WHERE b.id = ?
  `).get(req.params.id);

  if (!baseline) return res.status(404).json({ error: 'Baseline not found' });

  const items = db.prepare(`
    SELECT bi.*, eo.object_key, eo.title, eo.type, eo.status, bi.object_version as snapshot_version
    FROM baseline_items bi
    JOIN engineering_objects eo ON bi.object_id = eo.id
    WHERE bi.baseline_id = ?
  `).all(req.params.id);

  res.json({ ...baseline, items });
});

router.post('/baselines', (req, res) => {
  const { project_id, name, version_tag, description, created_by } = req.body;

  const result = db.prepare(`
    INSERT INTO baselines (project_id, name, version_tag, description, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(project_id || 1, name, version_tag, description || '', created_by || 1);

  const baselineId = Number(result.lastInsertRowid);

  // Snapshot current versions of all engineering objects in project
  const objects = db.prepare(`
    SELECT eo.id, eo.version
    FROM engineering_objects eo
    JOIN trackers t ON eo.tracker_id = t.id
    WHERE t.project_id = ?
  `).all(project_id || 1);

  for (const obj of objects as any[]) {
    db.prepare(`
      INSERT INTO baseline_items (baseline_id, object_id, object_version)
      VALUES (?, ?, ?)
    `).run(baselineId, obj.id, obj.version);
  }

  res.json({ success: true, id: baselineId });
});

// --- ARTIFACTS & AUDIT LOGS ---
router.get('/artifacts', (req, res) => {
  const artifacts = db.prepare(`
    SELECT a.*, u.name as uploader_name, eo.object_key, eo.title as object_title
    FROM artifacts a
    LEFT JOIN users u ON a.uploaded_by = u.id
    LEFT JOIN engineering_objects eo ON a.object_id = eo.id
    ORDER BY a.id DESC
  `).all();
  res.json(artifacts);
});

router.post('/artifacts/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { object_id, category, uploaded_by } = req.body;
  const file = req.file;

  const result = db.prepare(`
    INSERT INTO artifacts (object_id, filename, stored_path, file_size, mime_type, category, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(object_id || null, file.originalname, file.path, file.size, file.mimetype, category || 'OTHER', uploaded_by || 1);

  res.json({ success: true, id: result.lastInsertRowid, filename: file.originalname });
});

router.get('/audit', (req, res) => {
  const logs = db.prepare(`
    SELECT al.*, u.name as user_name, u.email as user_email
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.id DESC
    LIMIT 100
  `).all();
  res.json(logs.map((l: any) => ({ ...l, details: JSON.parse(l.details_json || '{}') })));
});

export default router;
