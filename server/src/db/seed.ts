import { db, initDatabase } from './database';

export function seedDatabase() {
  initDatabase();

  // Check if data already seeded
  const existingProject = db.prepare('SELECT id FROM projects WHERE key = ?').get('ROBO');
  if (existingProject) {
    console.log('Database already contains seed data.');
    return;
  }

  console.log('Seeding Autonomous Restaurant Delivery Robot (RoboServ-X1) data...');

  // 1. Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (email, name, role, avatar_url)
    VALUES (?, ?, ?, ?)
  `);

  insertUser.run('alex.chen@roboserv.io', 'Alex Chen', 'SYSTEMS_ENGINEER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex');
  insertUser.run('sarah.jenkins@roboserv.io', 'Sarah Jenkins', 'SOFTWARE_ENGINEER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah');
  insertUser.run('marcus.vance@roboserv.io', 'Marcus Vance', 'HARDWARE_ENGINEER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus');
  insertUser.run('elena.rostova@roboserv.io', 'Elena Rostova', 'TESTER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena');
  insertUser.run('admin@roboserv.io', 'Admin User', 'ADMIN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin');

  // 2. Seed Project
  const insertProject = db.prepare(`
    INSERT INTO projects (key, name, description)
    VALUES (?, ?, ?)
  `);
  const projectResult = insertProject.run(
    'ROBO',
    'RoboServ-X1 Autonomous Delivery Robot',
    'Full Systems Engineering Lifecycle Management for the next-gen autonomous indoor restaurant waiter & food delivery robot platform.'
  );
  const projectId = Number(projectResult.lastInsertRowid);

  // 3. Seed Trackers
  const insertTracker = db.prepare(`
    INSERT INTO trackers (project_id, key, name, type, prefix, fields_schema, workflow_schema)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const sysReqTrackerId = Number(insertTracker.run(projectId, 'SYS-REQ', 'System Requirements', 'REQUIREMENT', 'SYS-REQ-', '{}', '{}').lastInsertRowid);
  const swReqTrackerId = Number(insertTracker.run(projectId, 'SW-REQ', 'Software Requirements', 'REQUIREMENT', 'SW-REQ-', '{}', '{}').lastInsertRowid);
  const archTrackerId = Number(insertTracker.run(projectId, 'ARCH', 'System Architecture', 'ARCHITECTURE', 'ARCH-', '{}', '{}').lastInsertRowid);
  const riskTrackerId = Number(insertTracker.run(projectId, 'RISK', 'Risks & Hazards', 'RISK', 'RISK-', '{}', '{}').lastInsertRowid);
  const sysTestTrackerId = Number(insertTracker.run(projectId, 'SYS-TST', 'System Test Cases', 'TEST_CASE', 'SYS-TST-', '{}', '{}').lastInsertRowid);
  const testSetTrackerId = Number(insertTracker.run(projectId, 'TST-SET', 'Test Sets', 'TEST_SET', 'TST-SET-', '{}', '{}').lastInsertRowid);

  // 4. Seed Folders
  const insertFolder = db.prepare(`
    INSERT INTO folders (tracker_id, parent_id, name, position)
    VALUES (?, ?, ?, ?)
  `);

  const navFolderId = Number(insertFolder.run(sysReqTrackerId, null, 'Navigation & Perception', 1).lastInsertRowid);
  const safetyFolderId = Number(insertFolder.run(sysReqTrackerId, null, 'Safety & Emergency Stop', 2).lastInsertRowid);
  const thermalFolderId = Number(insertFolder.run(sysReqTrackerId, null, 'Payload & Thermal Containment', 3).lastInsertRowid);

  // 5. Seed Engineering Objects (Requirements, Architecture, Risks, Test Cases)
  const insertObject = db.prepare(`
    INSERT INTO engineering_objects (tracker_id, folder_id, object_key, title, description, type, status, priority, owner_id, version, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // System Requirements
  const sysReq1Id = Number(insertObject.run(
    sysReqTrackerId, navFolderId, 'SYS-REQ-001',
    'Obstacle Detection & Local Rerouting Latency',
    'The autonomous navigation system shall detect dynamic obstacles (e.g., restaurant patrons, moving waiters) within 3.0 meters and compute a local collision avoidance trajectory within < 50 milliseconds.',
    'REQUIREMENT', 'APPROVED', 'CRITICAL', 1, 1,
    JSON.stringify({
      rationale: 'Prevent collision in high-density indoor dining environments.',
      source: 'ISO 13482 Personal Care Robot Safety Standard',
      verificationMethod: 'Test',
      complianceStatus: 'Compliant'
    })
  ).lastInsertRowid);

  const sysReq2Id = Number(insertObject.run(
    sysReqTrackerId, safetyFolderId, 'SYS-REQ-002',
    'Physical & Software Emergency Braking Distance',
    'When an emergency stop signal is triggered (via hardware bumper or LiDAR safety zone breach), the robot shall come to a complete stop within 0.35 meters from a cruising speed of 1.5 m/s.',
    'REQUIREMENT', 'APPROVED', 'CRITICAL', 1, 1,
    JSON.stringify({
      rationale: 'Guarantee patron safety when sudden obstacles step directly into path.',
      source: 'Safety Hazard Analysis SHA-2026-01',
      verificationMethod: 'Test',
      complianceStatus: 'Verified'
    })
  ).lastInsertRowid);

  const sysReq3Id = Number(insertObject.run(
    sysReqTrackerId, thermalFolderId, 'SYS-REQ-003',
    'Active Hot Food Bay Thermal Maintenance',
    'The insulated payload compartment shall maintain hot soup and plated meals at a minimum internal temperature of 65°C for up to 25 minutes of continuous transit.',
    'REQUIREMENT', 'REVIEW', 'MEDIUM', 3, 1,
    JSON.stringify({
      rationale: 'Ensure food quality and customer satisfaction during peak dining hours.',
      source: 'Product Management PRD §4.2',
      verificationMethod: 'Inspection / Test',
      complianceStatus: 'In Review'
    })
  ).lastInsertRowid);

  // Software Requirements
  const swReq1Id = Number(insertObject.run(
    swReqTrackerId, null, 'SW-REQ-001',
    'ROS2 Nav2 DWB Dynamic Local Planner Configuration',
    'The software stack shall integrate ROS2 Iron Nav2 DWB local planner tuned with 20Hz local costmap updates using Ouster 3D LiDAR point cloud scans.',
    'REQUIREMENT', 'APPROVED', 'HIGH', 2, 1,
    JSON.stringify({
      rationale: 'Real-time reactive navigation in tight restaurant table aisles.',
      source: 'Derived from SYS-REQ-001',
      verificationMethod: 'Software Test'
    })
  ).lastInsertRowid);

  // Architecture Elements
  const arch1Id = Number(insertObject.run(
    archTrackerId, null, 'ARCH-001',
    'RoboServ-X1 Main Cyber-Physical System',
    'Top-level system architecture encapsulating Mobility Base, Sensor Suite, Thermal Bay, Compute, and Power.',
    'ARCHITECTURE', 'APPROVED', 'CRITICAL', 1, 1,
    JSON.stringify({
      archType: 'System',
      subsystems: ['Mobility', 'Sensors', 'Payload', 'Compute']
    })
  ).lastInsertRowid);

  const archSensorId = Number(insertObject.run(
    archTrackerId, null, 'ARCH-002',
    'Perception Sensor Suite (3D LiDAR + RGB-D Depth)',
    'Dual-sensor payload consisting of 1x Ouster OS1-32 Rev B 3D LiDAR and 2x Intel RealSense D435i cameras for floor-level drop/spill detection.',
    'ARCHITECTURE', 'APPROVED', 'HIGH', 3, 1,
    JSON.stringify({
      archType: 'Subsystem',
      allocatedHardware: 'Ouster OS1-32, RealSense D435i'
    })
  ).lastInsertRowid);

  // Risks & Hazards
  const risk1Id = Number(insertObject.run(
    riskTrackerId, null, 'RISK-001',
    'Robot Collision with Fast-Moving Dining Room Patron',
    'Hazard: Uncontrolled physical contact with restaurant customer in crowded dining area resulting in minor injury or food spill.',
    'RISK', 'REVIEW', 'CRITICAL', 1, 1,
    JSON.stringify({
      hazard: 'Kinetic collision at 1.5 m/s',
      cause: 'LiDAR occluded by chair leg or late obstacle detection',
      effect: 'Personal injury / property damage',
      severity: 5, // 1 to 5
      exposure: 4, // 1 to 5
      avoidance: 3, // 1 to 5
      riskRating: 60, // Severity * Exposure * Avoidance
      mitigation: 'Implement dual-zone safety field + <35cm stop distance (SYS-REQ-001 & SYS-REQ-002)'
    })
  ).lastInsertRowid);

  const risk2Id = Number(insertObject.run(
    riskTrackerId, null, 'RISK-002',
    'Hot Liquids/Soup Spill onto Customer during Sharp Turn',
    'Hazard: Scalding liquid spill due to abrupt angular acceleration during aisle maneuvers.',
    'RISK', 'APPROVED', 'HIGH', 3, 1,
    JSON.stringify({
      hazard: 'Thermal burn / slip hazard',
      cause: 'Aggressive local planner angular velocity without payload damping',
      effect: 'Scalding customer or floor friction drop',
      severity: 3,
      exposure: 4,
      avoidance: 2,
      riskRating: 24,
      mitigation: 'Active payload stabilization + smooth centripetal acceleration cap'
    })
  ).lastInsertRowid);

  // System Test Cases
  const sysTest1Id = Number(insertObject.run(
    sysTestTrackerId, null, 'SYS-TST-001',
    'Dynamic Pedestrian Avoidance & Latency Test',
    'Verify that the robot detects a dynamic human target walking across its path at 1.0 m/s and computes a non-colliding path without stopping abruptly unless emergency limit is reached.',
    'TEST_CASE', 'APPROVED', 'CRITICAL', 4, 1,
    JSON.stringify({
      objective: 'Validate <50ms local planner response time (SYS-REQ-001).',
      preconditions: 'Robot cruising at 1.2 m/s in open simulated dining room layout. ROS2 telemetry logger active.',
      postconditions: 'Robot passes obstacle with >0.5m clearance; zero safety zone breaches.'
    })
  ).lastInsertRowid);

  const sysTest2Id = Number(insertObject.run(
    sysTestTrackerId, null, 'SYS-TST-002',
    'Emergency Stop Braking Distance Field Test',
    'Perform hard emergency stop triggers at maximum operational velocity (1.5 m/s) and record stopping distance using optical tracking grid.',
    'TEST_CASE', 'APPROVED', 'CRITICAL', 4, 1,
    JSON.stringify({
      objective: 'Verify physical stopping distance <= 0.35 meters (SYS-REQ-002).',
      preconditions: 'Dry high-traction tile surface. Fully loaded tray bay (15kg payload).',
      postconditions: 'Stopping distance recorded in millimeter precision.'
    })
  ).lastInsertRowid);

  // 6. Seed Test Steps inside Test Cases
  const insertStep = db.prepare(`
    INSERT INTO test_steps (test_case_id, step_number, action, expected_result)
    VALUES (?, ?, ?, ?)
  `);

  insertStep.run(sysTest1Id, 1, 'Initialize ROS2 Nav2 stack and launch dynamic obstacle simulator node.', 'Nav2 status changes to ACTIVE; costmap initialized.');
  insertStep.run(sysTest1Id, 2, 'Command robot to navigate to Table 14 pose at target velocity 1.2 m/s.', 'Robot accelerates smoothly along global trajectory.');
  insertStep.run(sysTest1Id, 3, 'Inject dynamic pedestrian obstacle walking perpendicular across path at t=5.0s.', 'LiDAR pointcloud updates local costmap; detection latency logged < 50ms.');
  insertStep.run(sysTest1Id, 4, 'Observe local planner trajectory recalculation and smooth bypass.', 'Robot executes smooth arc avoiding obstacle with >0.5m buffer.');

  insertStep.run(sysTest2Id, 1, 'Drive robot straight down test track at steady 1.5 m/s with optical laser encoder active.', 'Target velocity 1.5 m/s confirmed via telemetry.');
  insertStep.run(sysTest2Id, 2, 'Trigger physical bumper impact bar at marked line X=5.0m.', 'Safety controller cuts motor power and fires electromagnetic brakes instantly.');
  insertStep.run(sysTest2Id, 3, 'Measure final wheel rest position relative to line X=5.0m using optical ground target.', 'Total stopping distance is <= 0.35m (350mm).');

  // 7. Seed Test Set & Test Configuration
  const testSetObjId = Number(insertObject.run(
    testSetTrackerId, null, 'TST-SET-001',
    'Safety & ISO 13482 Validation Test Set',
    'Comprehensive safety suite combining dynamic obstacle avoidance, e-stop braking, and tilt stability tests for compliance signoff.',
    'TEST_SET', 'APPROVED', 'CRITICAL', 1, 1,
    JSON.stringify({ targetRelease: 'Release 2.4 - Safety Candidate' })
  ).lastInsertRowid);

  const insertTestSetItem = db.prepare(`
    INSERT INTO test_set_items (test_set_id, test_case_id, position)
    VALUES (?, ?, ?)
  `);
  insertTestSetItem.run(testSetObjId, sysTest1Id, 1);
  insertTestSetItem.run(testSetObjId, sysTest2Id, 2);

  const insertConfig = db.prepare(`
    INSERT INTO test_configs (project_id, name, software_version, firmware_version, hardware_revision, sensor_config, parameter_config, battery_config, environment_config)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const configId = Number(insertConfig.run(
    projectId,
    'Nav Release v2.4.1 - Production Ouster Sensor Config',
    'v2.4.1-rc3 (ROS2 Iron)',
    'FW-v1.2.8-BMS',
    'HW Rev 3.2 (NVIDIA Jetson AGX Orin 64GB)',
    '1x Ouster OS1-32 LiDAR (10Hz) + 2x RealSense D435i',
    'max_vel_x: 1.5, max_accel_x: 1.2, stop_dist_limit: 0.35',
    '24V 30Ah LiFePO4 Smart Battery',
    'Simulated 200m² Dining Floor (Smooth Ceramic Tile, Ambient 22°C)'
  ).lastInsertRowid);

  // 8. Seed Test Run & Executed Results
  const insertRun = db.prepare(`
    INSERT INTO test_runs (project_id, test_set_id, test_config_id, name, overall_status, executed_by, started_at, completed_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const runId = Number(insertRun.run(
    projectId, testSetObjId, configId,
    'Safety Validation Run #1 (Build v2.4.1-rc3)',
    'PASS', 4,
    new Date(Date.now() - 3600000).toISOString(),
    new Date().toISOString(),
    'All safety verification tests executed cleanly. E-stop braking distance measured at 0.28m (well within 0.35m limit).'
  ).lastInsertRowid);

  const insertRunResult = db.prepare(`
    INSERT INTO test_run_results (test_run_id, test_case_id, status, notes, executed_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const runRes1Id = Number(insertRunResult.run(runId, sysTest1Id, 'PASS', 'Obstacle detection latency measured at 34ms average.', new Date().toISOString()).lastInsertRowid);
  const runRes2Id = Number(insertRunResult.run(runId, sysTest2Id, 'PASS', 'Measured stopping distance: 284mm (0.284m). PASS.', new Date().toISOString()).lastInsertRowid);

  const insertStepResult = db.prepare(`
    INSERT INTO test_step_results (test_run_result_id, test_step_id, status, actual_result, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertStepResult.run(runRes1Id, 1, 'PASS', 'Nav2 stack ACTIVE in 1.2 seconds.', 'Costmap ready.');
  insertStepResult.run(runRes1Id, 2, 'PASS', 'Robot accelerated to 1.2 m/s steady state.', 'Telemetry verified.');
  insertStepResult.run(runRes1Id, 3, 'PASS', 'Obstacle detected in 34ms.', 'Costmap updated.');
  insertStepResult.run(runRes1Id, 4, 'PASS', 'Avoidance clearance 0.68m achieved.', 'No safety breaches.');

  insertStepResult.run(runRes2Id, 1, 'PASS', 'Robot reached 1.5 m/s at X=4.8m.', 'Speed locked.');
  insertStepResult.run(runRes2Id, 2, 'PASS', 'Hardware e-stop bumper engaged at X=5.000m.', 'Power cut instantly.');
  insertStepResult.run(runRes2Id, 3, 'PASS', 'Final resting position X=5.284m (Distance: 0.284m).', 'Within 0.35m limit.');

  // 9. Seed Generic Relationships (Traceability Engine)
  const insertRel = db.prepare(`
    INSERT INTO relationships (source_id, source_version, target_id, target_version, relationship_type, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Risk -> Mitigated By -> System Requirement
  insertRel.run(risk1Id, 1, sysReq1Id, 1, 'MITIGATED_BY', 1);
  insertRel.run(risk1Id, 1, sysReq2Id, 1, 'MITIGATED_BY', 1);

  // System Requirement -> Derived To -> Software Requirement
  insertRel.run(sysReq1Id, 1, swReq1Id, 1, 'DERIVED_TO', 1);

  // System Requirement -> Verified By -> System Test Case
  insertRel.run(sysReq1Id, 1, sysTest1Id, 1, 'VERIFIED_BY', 1);
  insertRel.run(sysReq2Id, 1, sysTest2Id, 1, 'VERIFIED_BY', 1);

  // System Requirement -> Allocated To -> Architecture Element
  insertRel.run(sysReq1Id, 1, archSensorId, 1, 'ALLOCATED_TO', 1);

  // 10. Seed Change Request
  const insertCR = db.prepare(`
    INSERT INTO change_requests (project_id, cr_key, title, description, status, priority, author_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const crId = Number(insertCR.run(
    projectId, 'CR-001',
    'Increase Local Costmap Resolution & Lower Stop Distance Threshold',
    'Proposal to increase costmap voxel grid resolution from 5cm to 2cm for tighter dining room table navigation.',
    'REVIEW', 'HIGH', 2
  ).lastInsertRowid);

  const insertCRItem = db.prepare(`
    INSERT INTO change_request_items (change_request_id, object_id, proposed_change_notes)
    VALUES (?, ?, ?)
  `);
  insertCRItem.run(crId, sysReq1Id, 'Update obstacle detection latency target from 50ms to 35ms.');
  insertCRItem.run(crId, swReq1Id, 'Re-tune Nav2 costmap resolution parameter to 0.02m.');

  // 11. Seed Baseline
  const insertBaseline = db.prepare(`
    INSERT INTO baselines (project_id, name, version_tag, description, created_by)
    VALUES (?, ?, ?, ?, ?)
  `);
  const baselineId = Number(insertBaseline.run(
    projectId,
    'Baseline V1.0 - Initial Safety Validation Freeze',
    'v1.0-safety-approved',
    'Controlled snapshot of verified system requirements, architecture, and safety test cases for ISO 13482 certification audit.',
    1
  ).lastInsertRowid);

  const insertBaselineItem = db.prepare(`
    INSERT INTO baseline_items (baseline_id, object_id, object_version)
    VALUES (?, ?, ?)
  `);
  insertBaselineItem.run(baselineId, sysReq1Id, 1);
  insertBaselineItem.run(baselineId, sysReq2Id, 1);
  insertBaselineItem.run(baselineId, risk1Id, 1);
  insertBaselineItem.run(baselineId, arch1Id, 1);

  // 12. Seed Object Version Snapshots
  const insertVersion = db.prepare(`
    INSERT INTO object_versions (object_id, version, title, description, status, metadata_json, changed_fields, change_reason, author_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertVersion.run(sysReq1Id, 1, 'Obstacle Detection & Local Rerouting Latency', 'Initial baseline requirement creation', 'APPROVED', '{}', '[]', 'Initial release', 1);

  // 13. Seed Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (project_id, user_id, action, entity_type, entity_id, details_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run(projectId, 1, 'CREATE', 'REQUIREMENT', sysReq1Id, JSON.stringify({ message: 'Created System Requirement SYS-REQ-001' }));
  insertAudit.run(projectId, 4, 'EXECUTE_TEST', 'TEST_RUN', runId, JSON.stringify({ message: 'Executed Test Run TST-RUN-001 with status PASS' }));
  insertAudit.run(projectId, 1, 'CREATE_BASELINE', 'BASELINE', baselineId, JSON.stringify({ message: 'Frozen Baseline V1.0 - Initial Safety Validation Freeze' }));

  console.log('Successfully pre-populated Autonomous Restaurant Robot demonstration dataset!');
}
