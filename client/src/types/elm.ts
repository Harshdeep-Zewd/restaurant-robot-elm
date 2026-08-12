export type Role = 'ADMIN' | 'SYSTEMS_ENGINEER' | 'SOFTWARE_ENGINEER' | 'HARDWARE_ENGINEER' | 'TESTER' | 'REVIEWER' | 'VIEWER';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  avatar_url?: string;
}

export interface Project {
  id: number;
  key: string;
  name: string;
  description: string;
}

export interface Tracker {
  id: number;
  project_id: number;
  key: string;
  name: string;
  type: string;
  prefix: string;
  object_count?: number;
}

export interface Folder {
  id: number;
  tracker_id: number;
  parent_id: number | null;
  name: string;
  position: number;
}

export interface EngineeringObject {
  id: number;
  tracker_id: number;
  folder_id: number | null;
  object_key: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  owner_id: number;
  owner_name?: string;
  version: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ObjectVersion {
  id: number;
  object_id: number;
  version: number;
  title: string;
  description: string;
  status: string;
  metadata: Record<string, any>;
  changed_fields: string[];
  change_reason: string;
  author_name?: string;
  created_at: string;
}

export interface TestStep {
  id: number;
  test_case_id: number;
  step_number: number;
  action: string;
  expected_result: string;
}

export interface TestConfig {
  id: number;
  project_id: number;
  name: string;
  software_version: string;
  firmware_version: string;
  hardware_revision: string;
  sensor_config: string;
  parameter_config: string;
  battery_config: string;
  environment_config: string;
}

export interface TestRun {
  id: number;
  project_id: number;
  test_set_id: number;
  test_config_id: number;
  name: string;
  overall_status: 'NOT_RUN' | 'IN_PROGRESS' | 'PASS' | 'FAIL' | 'BLOCKED' | 'INCONCLUSIVE';
  tester_name?: string;
  test_set_key?: string;
  test_set_title?: string;
  config_name?: string;
  software_version?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
}

export interface TestRunResult {
  id: number;
  test_run_id: number;
  test_case_id: number;
  case_key?: string;
  case_title?: string;
  priority?: string;
  status: 'NOT_RUN' | 'IN_PROGRESS' | 'PASS' | 'FAIL' | 'BLOCKED' | 'INCONCLUSIVE';
  notes?: string;
  steps?: TestStepResult[];
}

export interface TestStepResult {
  id: number;
  test_run_result_id: number;
  test_step_id: number;
  step_number?: number;
  action?: string;
  expected_result?: string;
  status: 'NOT_RUN' | 'PASS' | 'FAIL' | 'BLOCKED';
  actual_result?: string;
  notes?: string;
}

export interface Relationship {
  id: number;
  source_id: number;
  target_id: number;
  source_key?: string;
  source_title?: string;
  source_type?: string;
  target_key?: string;
  target_title?: string;
  target_type?: string;
  relationship_type: 'VERIFIED_BY' | 'MITIGATED_BY' | 'ALLOCATED_TO' | 'DERIVED_TO' | 'INCLUDED_IN' | 'EXECUTED_AS' | 'USES_CONFIG' | 'PRODUCES_RESULT' | 'DEPENDS_ON' | 'IMPLEMENTED_BY';
}

export interface ChangeRequest {
  id: number;
  project_id: number;
  cr_key: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'IMPLEMENTED' | 'VERIFIED' | 'REJECTED';
  priority: string;
  author_name?: string;
  item_count?: number;
  created_at: string;
}

export interface Baseline {
  id: number;
  project_id: number;
  name: string;
  version_tag: string;
  description: string;
  author_name?: string;
  item_count?: number;
  created_at: string;
  items?: BaselineItem[];
}

export interface BaselineItem {
  id: number;
  baseline_id: number;
  object_id: number;
  object_key: string;
  title: string;
  type: string;
  status: string;
  snapshot_version: number;
}

export interface Artifact {
  id: number;
  object_id?: number;
  filename: string;
  stored_path: string;
  file_size: number;
  mime_type: string;
  category: 'CAD' | 'ROS_BAG' | 'LOG' | 'CSV' | 'PDF' | 'IMAGE' | 'OTHER';
  uploader_name?: string;
  object_key?: string;
  object_title?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_name: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: number;
  details: Record<string, any>;
  created_at: string;
}
