import { Tracker } from '../types/elm';

export interface TrackerTemplate {
  index: number;
  name: string;
  key: string;
  category: string;
  type: string;
  prefix: string;
  source: string;
  desc: string;
  enable_test_steps?: boolean;
}

export const CANONICAL_TRACKERS: TrackerTemplate[] = [
  // 1. Requirements & Verification (11)
  {
    index: 1,
    name: '020_IRS_Internal_Requirement_Specification',
    key: 'IRS',
    category: 'Requirements & Verification',
    type: 'REQUIREMENT',
    prefix: 'IRS-',
    source: 'Image 3',
    desc: 'Internal engineering requirements, technical specifications, and internal boundary constraints.'
  },
  {
    index: 2,
    name: '022_Customer Quality Requirements',
    key: 'CQR',
    category: 'Requirements & Verification',
    type: 'REQUIREMENT',
    prefix: 'CQR-',
    source: 'Image 3',
    desc: 'Customer-mandated quality metrics, reliability targets, MTBF goals, and warranty expectations.'
  },
  {
    index: 3,
    name: '023_Customer Requirement Specification SW',
    key: 'CRSSW',
    category: 'Requirements & Verification',
    type: 'REQUIREMENT',
    prefix: 'CRSSW-',
    source: 'Image 3',
    desc: 'Customer-specified software features, UI/UX interaction workflows, and mission logic.'
  },
  {
    index: 4,
    name: '024_Customer Requirement Specification EMC',
    key: 'CRSEMC',
    category: 'Requirements & Verification',
    type: 'REQUIREMENT',
    prefix: 'CRSEMC-',
    source: 'Image 3',
    desc: 'Customer electromagnetic compatibility standards, emission ceilings, and immunity requirements.'
  },
  {
    index: 5,
    name: '025_Customer Requirement Specification Test',
    key: 'CRST',
    category: 'Requirements & Verification',
    type: 'REQUIREMENT',
    prefix: 'CRST-',
    source: 'Image 3',
    desc: 'Customer acceptance testing criteria, test witness requirements, and compliance proof demands.'
  },
  {
    index: 6,
    name: '027_Customer Requirement Specification ENV',
    key: 'CRSENV',
    category: 'Requirements & Verification',
    type: 'REQUIREMENT',
    prefix: 'CRSENV-',
    source: 'Image 3',
    desc: 'Environmental tolerance standards: thermal range, humidity, ingress protection, and shock.'
  },
  {
    index: 7,
    name: '028_CRS Referenced Documents',
    key: 'CRSREF',
    category: 'Requirements & Verification',
    type: 'DOCUMENT',
    prefix: 'CRSREF-',
    source: 'Image 3',
    desc: 'External normative standards, client interface agreements, and customer statements of work.'
  },
  {
    index: 8,
    name: '031_System Requirement Specification',
    key: 'SRS',
    category: 'Requirements & Verification',
    type: 'REQUIREMENT',
    prefix: 'SRS-',
    source: 'Image 3',
    desc: 'Master system functional and non-functional requirements governing the complete robot platform.'
  },
  {
    index: 9,
    name: '0311_Parameter_Specification',
    key: 'PAR',
    category: 'Requirements & Verification',
    type: 'REQUIREMENT',
    prefix: 'PAR-',
    source: 'Image 3',
    desc: 'Quantitative operating limits, speed limits, payload capacity, sensor tolerances, and thresholds.'
  },
  {
    index: 10,
    name: '036_System Requirement Verification',
    key: 'SRV',
    category: 'Requirements & Verification',
    type: 'REQUIREMENT',
    prefix: 'SRV-',
    source: 'Image 3',
    desc: 'Verification method assignment (Test, Analysis, Demo, Inspection) and verification cross-reference matrix.'
  },
  {
    index: 11,
    name: '0361_System Requirement Verification_old',
    key: 'SRV_OLD',
    category: 'Requirements & Verification',
    type: 'REQUIREMENT',
    prefix: 'SRV-OLD-',
    source: 'Image 2, Image 3',
    desc: 'Archived prior verification baselines, legacy qualification criteria, and traceability history.'
  },

  // 2. Safety & Quality Assurance (3)
  {
    index: 12,
    name: 'Risks_SWRS',
    key: 'RSWRS',
    category: 'Safety & Quality Assurance',
    type: 'RISK',
    prefix: 'RSWRS-',
    source: 'Image 1',
    desc: 'Software safety risks, ASIL hazard ratings, kinetic collision hazards, and fail-safe mitigations.'
  },
  {
    index: 13,
    name: '10_Quality Assurance',
    key: 'QA',
    category: 'Safety & Quality Assurance',
    type: 'REQUIREMENT',
    prefix: 'QA-',
    source: 'Image 3, Image 4',
    desc: 'Quality assurance gate checklists, ISO 9001 process audits, and peer inspection approvals.'
  },
  {
    index: 14,
    name: '011_Safetyplan',
    key: 'SafeP',
    category: 'Safety & Quality Assurance',
    type: 'DOCUMENT',
    prefix: 'SafeP-',
    source: 'Image 3, Image 4',
    desc: 'Functional safety management plan, safety lifecycle milestones, and ISO 13482 safety case roadmap.'
  },

  // 3. System Architecture & Engineering (8)
  {
    index: 15,
    name: '030_Systems Engineering Strategie',
    key: 'SYS_STRATEGY',
    category: 'System Architecture & Engineering',
    type: 'DOCUMENT',
    prefix: 'SYS-STRAT-',
    source: 'Image 3',
    desc: 'V-model systems engineering strategy, milestone review gates, and decomposition architecture.'
  },
  {
    index: 16,
    name: '0312_COM Matrix',
    key: 'COM',
    category: 'System Architecture & Engineering',
    type: 'ARCHITECTURE',
    prefix: 'COM-',
    source: 'Image 3',
    desc: 'CAN bus 2.0B, Ethernet, and ROS2 DDS topic/service message dictionary and communication frame layout.'
  },
  {
    index: 17,
    name: '0313_Diagnostic_Services',
    key: 'DS',
    category: 'System Architecture & Engineering',
    type: 'ARCHITECTURE',
    prefix: 'DS-',
    source: 'Image 3',
    desc: 'Unified Diagnostic Services (UDS / ISO 14229) definitions, session management, and routine control.'
  },
  {
    index: 18,
    name: '0314_FaultCodeList',
    key: 'FC',
    category: 'System Architecture & Engineering',
    type: 'ARCHITECTURE',
    prefix: 'FC-',
    source: 'Image 3',
    desc: 'Diagnostic Trouble Codes (DTC), fault detection debounce rules, warning chime triggers, and safe states.'
  },
  {
    index: 19,
    name: '032_System Architectural Design',
    key: 'SAD',
    category: 'System Architecture & Engineering',
    type: 'ARCHITECTURE',
    prefix: 'SAD-',
    source: 'Image 3',
    desc: 'Physical, mechanical, and electrical decomposition into Mobility, Payload, Sensors, and Compute subsystems.'
  },
  {
    index: 20,
    name: '033_TCI',
    key: 'TCI',
    category: 'System Architecture & Engineering',
    type: 'ARCHITECTURE',
    prefix: 'TCI-',
    source: 'Image 3',
    desc: 'Technical Customer Interface (TCI) specifications, telemetry push APIs, and remote dispatch endpoints.'
  },
  {
    index: 21,
    name: '034_Hardware-Software-Interface',
    key: 'HSI',
    category: 'System Architecture & Engineering',
    type: 'ARCHITECTURE',
    prefix: 'HSI-',
    source: 'Image 3',
    desc: 'Hardware-Software Interface (HSI) register maps, GPIO assignments, ADC channels, and HAL drivers.'
  },
  {
    index: 22,
    name: '038_SYS Design',
    key: 'SYSD',
    category: 'System Architecture & Engineering',
    type: 'ARCHITECTURE',
    prefix: 'SYSD-',
    source: 'Image 2',
    desc: 'High-level cyber-physical systems design specifications and multi-domain engineering blueprints.'
  },

  // 4. Hardware & Electronics Engineering (12)
  {
    index: 23,
    name: '04_Electrical (EM) Design',
    key: 'EMD',
    category: 'Hardware & Electronics',
    type: 'ARCHITECTURE',
    prefix: 'EMD-',
    source: 'Image 2',
    desc: 'Power distribution unit (48V / 24V / 5V DC), battery management system, wiring harnesses, and fusing.'
  },
  {
    index: 24,
    name: '041_Mechanical Design',
    key: 'MD',
    category: 'Hardware & Electronics',
    type: 'ARCHITECTURE',
    prefix: 'MD-',
    source: 'Image 2',
    desc: 'Mobile chassis, differential drive suspension, insulated food compartment, and structural enclosures.'
  },
  {
    index: 25,
    name: '051_HW Requirements Specification',
    key: 'HWRS',
    category: 'Hardware & Electronics',
    type: 'REQUIREMENT',
    prefix: 'HWRS-',
    source: 'Image 2',
    desc: 'Component-level hardware specifications, PCB operating temperatures, power dissipation, and load limits.'
  },
  {
    index: 26,
    name: '052_HW Architectural Design',
    key: 'HWAD',
    category: 'Hardware & Electronics',
    type: 'ARCHITECTURE',
    prefix: 'HWAD-',
    source: 'Image 2',
    desc: 'Microcontroller topology (STM32 / TI), safety microcontroller redundancy, and motor drive controllers.'
  },
  {
    index: 27,
    name: '053_HW Detailed Design',
    key: 'HWDD',
    category: 'Hardware & Electronics',
    type: 'ARCHITECTURE',
    prefix: 'HWDD-',
    source: 'Image 2',
    desc: 'Detailed electronic circuit schematics, bill of materials (BOM), Altium PCB layouts, and component pinouts.'
  },
  {
    index: 28,
    name: '054A_EMC Test Plan DV',
    key: 'EMC_DV',
    category: 'Hardware & Electronics',
    type: 'TEST_SPEC',
    prefix: 'EMC-DV-',
    source: 'Image 2',
    desc: 'Design Verification (DV) test protocol for conducted and radiated electromagnetic compatibility emissions.'
  },
  {
    index: 29,
    name: '054B_EMC Test Report DV',
    key: 'EMC_RPT',
    category: 'Hardware & Electronics',
    type: 'TEST_SPEC',
    prefix: 'EMC-RPT-',
    source: 'Image 2',
    desc: 'Design Verification (DV) test results, anechoic chamber plots, immunity thresholds, and corrective fixes.'
  },
  {
    index: 30,
    name: '054C_EMC Test Plan PV',
    key: 'EMC_PV',
    category: 'Hardware & Electronics',
    type: 'TEST_SPEC',
    prefix: 'EMC-PV-',
    source: 'Image 2',
    desc: 'Production Validation (PV) electromagnetic compatibility validation plan for mass production units.'
  },
  {
    index: 31,
    name: '054D_EMV Test Report PV',
    key: 'EMV_RPT',
    category: 'Hardware & Electronics',
    type: 'TEST_SPEC',
    prefix: 'EMV-RPT-',
    source: 'Image 2',
    desc: 'Production Validation (PV) certified EMC/EMV test reports and regulatory compliance certificates.'
  },
  {
    index: 32,
    name: '057_HW Design Verification',
    key: 'HWDV',
    category: 'Hardware & Electronics',
    type: 'TEST_SPEC',
    prefix: 'HWDV-',
    source: 'Image 2',
    desc: 'Hardware design review compliance matrix, derating analysis, and thermal simulation verification.'
  },
  {
    index: 33,
    name: '061_HW Test Plan',
    key: 'HWTP',
    category: 'Hardware & Electronics',
    type: 'TEST_SPEC',
    prefix: 'HWTP-',
    source: 'Image 2',
    desc: 'Comprehensive hardware bench, power cycling, overvoltage, short circuit, and stress test plan.'
  },
  {
    index: 34,
    name: '062_HW Test Report',
    key: 'HWTR',
    category: 'Hardware & Electronics',
    type: 'TEST_SPEC',
    prefix: 'HWTR-',
    source: 'Image 2',
    desc: 'Hardware bench test results, oscilloscope captures, thermal camera imaging, and engineer sign-offs.'
  },

  // 5. Software Engineering & Architecture (5)
  {
    index: 35,
    name: '070_High level SW requirements',
    key: 'HLSW',
    category: 'Software Engineering & Architecture',
    type: 'REQUIREMENT',
    prefix: 'HLSW-',
    source: 'Image 2',
    desc: 'High-level software use cases, robot fleet coordination, table mapping, and mission planners.'
  },
  {
    index: 36,
    name: '071_SW Requirements Specification',
    key: 'SWRS',
    category: 'Software Engineering & Architecture',
    type: 'REQUIREMENT',
    prefix: 'SWRS-',
    source: 'Image 2',
    desc: 'Detailed software requirement specifications, dynamic obstacle avoidance logic, and DWB local planner specs.'
  },
  {
    index: 37,
    name: '0711_Software customer topic list',
    key: 'SWCTL',
    category: 'Software Engineering & Architecture',
    type: 'REQUIREMENT',
    prefix: 'SWCTL-',
    source: 'Image 2',
    desc: 'Client-requested software customization requests, kitchen POS system integration hooks, and feature wishlists.'
  },
  {
    index: 38,
    name: '072_SW Architectural Design',
    key: 'SWAD',
    category: 'Software Engineering & Architecture',
    type: 'ARCHITECTURE',
    prefix: 'SWAD-',
    source: 'Image 2',
    desc: 'ROS2 node graph, micro-ROS firmware architecture, sensor fusion pipeline, and DDS middleware layout.'
  },
  {
    index: 39,
    name: '073_SW Detailed Design',
    key: 'SWDD',
    category: 'Software Engineering & Architecture',
    type: 'ARCHITECTURE',
    prefix: 'SWDD-',
    source: 'Image 2',
    desc: 'Software module class diagrams, state machine transitions, algorithm pseudocode, and thread models.'
  },

  // 6. Test Specifications & Strategy (7)
  {
    index: 40,
    name: '066_Hardware Software Integration Testplan',
    key: 'HSITP',
    category: 'Test Specifications & Strategy',
    type: 'TEST_SPEC',
    prefix: 'HSITP-',
    source: 'Image 2',
    desc: 'Integration test plan verifying motor controller firmware, CAN bus latency, and sensor driver communications.'
  },
  {
    index: 41,
    name: '121_Design Verification Plan (B-Samples)',
    key: 'DVP_B',
    category: 'Test Specifications & Strategy',
    type: 'TEST_SPEC',
    prefix: 'DVP-B-',
    source: 'Image 4',
    desc: 'Phase B prototype engineering design verification plan covering environmental, stress, and functional criteria.'
  },
  {
    index: 42,
    name: '123_Product Validation Plan (C-Samples)',
    key: 'PVP_C',
    category: 'Test Specifications & Strategy',
    type: 'TEST_SPEC',
    prefix: 'PVP-C-',
    source: 'Image 4',
    desc: 'Phase C pilot-production validation plan verifying end-to-end reliability and manufacturing yield.'
  },
  {
    index: 43,
    name: '127_System Qualification Test Specification',
    key: 'SQTSPEC',
    category: 'Test Specifications & Strategy',
    type: 'TEST_SPEC',
    prefix: 'SQTSPEC-',
    source: 'Image 3, Image 4',
    desc: 'Formal system qualification test procedures validating adherence to ISO 13482 safety requirements.'
  },
  {
    index: 44,
    name: '133_System Integration and Integration Test Specification',
    key: 'SIITS',
    category: 'Test Specifications & Strategy',
    type: 'TEST_SPEC',
    prefix: 'SIITS-',
    source: 'Image 3',
    desc: 'Multi-subsystem integration procedures verifying simultaneous motion, obstacle evasion, and thermal hold.'
  },
  {
    index: 45,
    name: '161_Mechanical Qualification Test Plan',
    key: 'MQTP',
    category: 'Test Specifications & Strategy',
    type: 'TEST_SPEC',
    prefix: 'MQTP-',
    source: 'Image 3',
    desc: 'Chassis drop test, dynamic vibration, payload bay spill resistance, and door latch endurance test protocols.'
  },
  {
    index: 46,
    name: 'System Test Strategy RR4x',
    key: 'STS_RR4x',
    category: 'Test Specifications & Strategy',
    type: 'TEST_SPEC',
    prefix: 'STS-RR4X-',
    source: 'Image 4',
    desc: 'System-wide test coverage strategy, verification gates, and release qualification criteria for RR4x milestone.'
  },

  // 7. Test Cases (8)
  {
    index: 47,
    name: '0761_Test Engineering Cases',
    key: 'TEC',
    category: 'Test Cases',
    type: 'TEST_CASE',
    prefix: 'TEC-',
    source: 'Image 4',
    desc: 'Engineering test cases verifying low-level bus voltage, optical sensor tripwire timings, and watchdog resets.',
    enable_test_steps: true
  },
  {
    index: 48,
    name: '0941_Test Cases Software Qualification Test',
    key: 'TCSQT_C',
    category: 'Test Cases',
    type: 'TEST_CASE',
    prefix: 'TCSQT-C-',
    source: 'Image 4',
    desc: 'Formal software qualification test cases with inputs, preconditions, expected outputs, and pass criteria.',
    enable_test_steps: true
  },
  {
    index: 49,
    name: '0951_Test Cases Software Integration Test',
    key: 'TCSIT_C',
    category: 'Test Cases',
    type: 'TEST_CASE',
    prefix: 'TCSIT-C-',
    source: 'Image 4',
    desc: 'Integration test cases verifying ROS2 inter-node topic streaming, localization accuracy, and cmd_vel twists.',
    enable_test_steps: true
  },
  {
    index: 50,
    name: '0961_Test Cases Software Unit Test',
    key: 'TCSUT_C',
    category: 'Test Cases',
    type: 'TEST_CASE',
    prefix: 'TCSUT-C-',
    source: 'Image 4',
    desc: 'Algorithmic unit test cases testing costmap inflation calculations, path smoothing, and thermal PID algorithms.',
    enable_test_steps: true
  },
  {
    index: 51,
    name: '371_Test Cases Hardware Qualification Test',
    key: 'TCHWT',
    category: 'Test Cases',
    type: 'TEST_CASE',
    prefix: 'TCHWT-',
    source: 'Image 3, Image 5',
    desc: 'Hardware qualification test cases: thermal chamber load, ESD contact discharge, and mechanical shock.',
    enable_test_steps: true
  },
  {
    index: 52,
    name: '372_Test Cases Integration Test',
    key: 'TCIT',
    category: 'Test Cases',
    type: 'TEST_CASE',
    prefix: 'TCIT-',
    source: 'Image 3, Image 5',
    desc: 'Subsystem-to-subsystem integration test cases for CAN bus failover, LiDAR dropout handling, and e-stop trip.',
    enable_test_steps: true
  },
  {
    index: 53,
    name: 'Reliability Test',
    key: 'REL',
    category: 'Test Cases',
    type: 'TEST_CASE',
    prefix: 'REL-',
    source: 'Image 3, Image 5',
    desc: 'Continuous 500-hour stress run test cases, wheel tire wear measurements, and battery cycle degradation.',
    enable_test_steps: true
  },
  {
    index: 54,
    name: 'Test Cases',
    key: 'TESTCASE',
    category: 'Test Cases',
    type: 'TEST_CASE',
    prefix: 'TC-',
    source: 'Image 3, Image 5',
    desc: 'Universal test case library supporting step-by-step action sequences, expected outcomes, and parameters.',
    enable_test_steps: true
  },

  // 8. Test Configurations (7)
  {
    index: 55,
    name: '0763_Test Engineering Configuration',
    key: 'ETCG',
    category: 'Test Configurations',
    type: 'TEST_SET',
    prefix: 'ETCG-',
    source: 'Image 3, Image 5',
    desc: 'Engineering test bench hardware setup, power supplies, CAN sniffer configurations, and harness pinouts.'
  },
  {
    index: 56,
    name: '0942_Test Configurations Software Qualification Test',
    key: 'TCSQT',
    category: 'Test Configurations',
    type: 'TEST_SET',
    prefix: 'TCSQT-',
    source: 'Image 3, Image 5',
    desc: 'Software qualification environment settings, test node environments, and automated test runner params.'
  },
  {
    index: 57,
    name: '0952_Test Configurations Software Integration Test',
    key: 'TCSIT',
    category: 'Test Configurations',
    type: 'TEST_SET',
    prefix: 'TCSIT-',
    source: 'Image 3, Image 5',
    desc: 'Software-in-the-Loop (SIL) simulation world profiles, Gazebo restaurant floor models, and obstacle rigs.'
  },
  {
    index: 58,
    name: '0962_Test Configurations Software Unit Test',
    key: 'TCSUT',
    category: 'Test Configurations',
    type: 'TEST_SET',
    prefix: 'TCSUT-',
    source: 'Image 3, Image 5',
    desc: 'Unit test framework flags, gtest / pytest runner configurations, and sanitizers (ASan/UBSan).'
  },
  {
    index: 59,
    name: '129_System Qualification Test Configurations',
    key: 'SQTC',
    category: 'Test Configurations',
    type: 'TEST_SET',
    prefix: 'SQTC-',
    source: 'Image 3, Image 5',
    desc: 'Full-scale physical test pen configurations, optical motion capture tracking grids, and mannequin fixtures.'
  },
  {
    index: 60,
    name: '381_Test Configurations Hardware Qualification Test',
    key: 'TC_HW_T',
    category: 'Test Configurations',
    type: 'TEST_SET',
    prefix: 'TCHWT-CFG-',
    source: 'Image 3, Image 5',
    desc: 'Environmental chamber thermal profiles (-10C to +55C), vibration shaker profiles, and power load profiles.'
  },
  {
    index: 61,
    name: '382_Test Configurations Integration Test',
    key: 'TCIT_CFG',
    category: 'Test Configurations',
    type: 'TEST_SET',
    prefix: 'TCIT-CFG-',
    source: 'Image 3, Image 5',
    desc: 'Hardware-in-the-Loop (HIL) wiring setups, bus fault injection rigs, and simulated wheel speed encoders.'
  },

  // 9. Test Sets (8)
  {
    index: 62,
    name: '0762_Test Engineering Sets',
    key: 'ETS',
    category: 'Test Sets',
    type: 'TEST_SET',
    prefix: 'ETS-',
    source: 'Image 3, Image 5',
    desc: 'Diagnostic test case collections batched together for automated daily CI engineering smoke tests.'
  },
  {
    index: 63,
    name: '0943_Test Sets Software Qualification Test',
    key: 'TSSQT',
    category: 'Test Sets',
    type: 'TEST_SET',
    prefix: 'TSSQT-',
    source: 'Image 3, Image 5',
    desc: 'Official software qualification test set packages required for software release sign-off.'
  },
  {
    index: 64,
    name: '0953_Test Sets Software Integration Test',
    key: 'ISSIT',
    category: 'Test Sets',
    type: 'TEST_SET',
    prefix: 'ISSIT-',
    source: 'Image 3, Image 5',
    desc: 'Nightly regression test suites verifying cross-subsystem interface compatibility.'
  },
  {
    index: 65,
    name: '0963_Test Sets Software Unit Test',
    key: 'TSSUT',
    category: 'Test Sets',
    type: 'TEST_SET',
    prefix: 'TSSUT-',
    source: 'Image 3, Image 5',
    desc: 'Batched code unit test suites enforcing strict >90% branch and statement coverage.'
  },
  {
    index: 66,
    name: '128_System Qualification Test Sets',
    key: 'SQTS',
    category: 'Test Sets',
    type: 'TEST_SET',
    prefix: 'SQTS-',
    source: 'Image 3, Image 5',
    desc: 'System-level test suites mapped directly to ISO 13482 safety requirements and customer PRDs.'
  },
  {
    index: 67,
    name: '135_System Integration Test Sets',
    key: 'SITS',
    category: 'Test Sets',
    type: 'TEST_SET',
    prefix: 'SITS-',
    source: 'Image 3, Image 5',
    desc: 'Integration test packages executed on fully assembled prototype robots on test courses.'
  },
  {
    index: 68,
    name: '391_Test Sets Hardware Qualification Test',
    key: 'TSSST',
    category: 'Test Sets',
    type: 'TEST_SET',
    prefix: 'TSSST-',
    source: 'Image 5',
    desc: 'Hardware environmental, electrical stress, and thermal qualification test suites.'
  },
  {
    index: 69,
    name: '392_Test Sets Integration Test',
    key: 'TSIT',
    category: 'Test Sets',
    type: 'TEST_SET',
    prefix: 'TSIT-',
    source: 'Image 5',
    desc: 'Combined hardware-software integration test suites run during sprint stabilization.'
  },

  // 10. Test Runs & Execution (2)
  {
    index: 70,
    name: '130_System Qualification Test Runs',
    key: 'SQTR',
    category: 'Test Runs & Execution',
    type: 'TEST_SET',
    prefix: 'SQTR-',
    source: 'Image 1',
    desc: 'System qualification test run execution records, step-by-step pass/fail verdicts, and sensor logs.'
  },
  {
    index: 71,
    name: 'Test Runs',
    key: 'TESTRUN',
    category: 'Test Runs & Execution',
    type: 'TEST_SET',
    prefix: 'RUN-',
    source: 'Image 1',
    desc: 'Global test run execution ledger containing run duration, tester signature, and test evidence attachments.'
  },

  // 11. Test Tasks & Reviews (5)
  {
    index: 72,
    name: '063_HW Tests',
    key: 'HWT',
    category: 'Test Tasks & Reviews',
    type: 'TASK',
    prefix: 'HWT-',
    source: 'Image 4',
    desc: 'Hardware testing tasks assigned to electrical test technicians and validation engineers.'
  },
  {
    index: 73,
    name: '065_HW Test Tasks',
    key: 'HWTT',
    category: 'Test Tasks & Reviews',
    type: 'TASK',
    prefix: 'HWTT-',
    source: 'Image 1',
    desc: 'Specific test execution tasks for environmental chambers, vibration shakers, and power benches.'
  },
  {
    index: 74,
    name: '091_SW Test Tasks',
    key: 'SWT',
    category: 'Test Tasks & Reviews',
    type: 'TASK',
    prefix: 'SWT-',
    source: 'Image 4',
    desc: 'Software testing tasks for test plan writing, test case authoring, and automated CI test script creation.'
  },
  {
    index: 75,
    name: '092_SW Test Reviews',
    key: 'SWTR',
    category: 'Test Tasks & Reviews',
    type: 'TASK',
    prefix: 'SWTR-',
    source: 'Image 4',
    desc: 'Peer reviews of test specifications, test step criteria, test coverage audits, and quality approvals.'
  },
  {
    index: 76,
    name: 'System Test Task',
    key: 'SysTest Task',
    category: 'Test Tasks & Reviews',
    type: 'TASK',
    prefix: 'SYSTEST-',
    source: 'Image 4',
    desc: 'System validation task assignments, course setup tasks, mannequin positioning, and data acquisition.'
  },

  // 12. Defects, Failures & Problem Reports (5)
  {
    index: 77,
    name: '055_HW Failures',
    key: 'HWBUG',
    category: 'Defects, Failures & Problem Reports',
    type: 'DEFECT',
    prefix: 'HWBUG-',
    source: 'Image 4',
    desc: 'Hardware component defects, PCB solder joint cracks, motor overheating, and sensor disconnects.'
  },
  {
    index: 78,
    name: '064_HW Testing Failures',
    key: 'HWTF',
    category: 'Defects, Failures & Problem Reports',
    type: 'DEFECT',
    prefix: 'HWTF-',
    source: 'Image 4',
    desc: 'Anomalies and failures detected specifically during environmental, thermal, and stress test campaigns.'
  },
  {
    index: 79,
    name: '075_SW Bugs',
    key: 'SWBUG',
    category: 'Defects, Failures & Problem Reports',
    type: 'DEFECT',
    prefix: 'SWBUG-',
    source: 'Image 4',
    desc: 'Software defects: segmentation faults, ROS2 node crashes, navigation path oscillations, and latency spikes.'
  },
  {
    index: 80,
    name: 'Problem Report',
    key: 'PR',
    category: 'Defects, Failures & Problem Reports',
    type: 'DEFECT',
    prefix: 'PR-',
    source: 'Image 4',
    desc: 'Formal Engineering Problem Reports (PR) detailing defect symptoms, root causes, and containment actions.'
  },
  {
    index: 81,
    name: 'Problem Report Octane',
    key: 'PRO',
    category: 'Defects, Failures & Problem Reports',
    type: 'DEFECT',
    prefix: 'PRO-',
    source: 'Image 4',
    desc: 'Synchronized enterprise defect tracker interfacing external ALM / Micro Focus Octane systems.'
  },

  // 13. Tasks & Epics (9)
  {
    index: 82,
    name: '037_SYS Tasks',
    key: 'SYS_TASK',
    category: 'Tasks & Epics',
    type: 'TASK',
    prefix: 'SYS-TASK-',
    source: 'Image 1',
    desc: 'System engineering tasks: requirement decomposition, trade studies, safety reviews, and interface audits.'
  },
  {
    index: 83,
    name: '056_HW Tasks',
    key: 'HWTASK',
    category: 'Tasks & Epics',
    type: 'TASK',
    prefix: 'HWTASK-',
    source: 'Image 1',
    desc: 'Hardware design tasks: component selection, PCB schematic drafting, CAD revisions, and harness routing.'
  },
  {
    index: 84,
    name: '074_SW Tasks',
    key: 'SWTASK',
    category: 'Tasks & Epics',
    type: 'TASK',
    prefix: 'SWTASK-',
    source: 'Image 1',
    desc: 'Software sprint tasks: driver development, navigation parameter tuning, and UI dashboard enhancements.'
  },
  {
    index: 85,
    name: '0741 SW Epic',
    key: 'SWEPIC',
    category: 'Tasks & Epics',
    type: 'TASK',
    prefix: 'SWEPIC-',
    source: 'Image 4',
    desc: 'Major software epic initiatives: Autonomous Fleet Management, ISO 13482 Safety Stack, Nav2 Migration.'
  },
  {
    index: 86,
    name: '143_QAD Tasks (Old Version)',
    key: 'QAD_T_OLD',
    category: 'Tasks & Epics',
    type: 'TASK',
    prefix: 'QAD-OLD-',
    source: 'Image 1',
    desc: 'Archived quality assurance tasks and legacy process audit items.'
  },
  {
    index: 87,
    name: '143_QAD Tasks (XNF)',
    key: 'QAD_T',
    category: 'Tasks & Epics',
    type: 'TASK',
    prefix: 'QAD-',
    source: 'Image 4',
    desc: 'Active quality assurance department tasks, vendor quality checks, and production line audit tasks.'
  },
  {
    index: 88,
    name: '144_QAD Epic',
    key: 'QADEPIC',
    category: 'Tasks & Epics',
    type: 'TASK',
    prefix: 'QADEPIC-',
    source: 'Image 4',
    desc: 'Quality assurance strategic epics: Supplier Quality Qualification, Cleanroom Standards, Process Capability.'
  },
  {
    index: 89,
    name: 'RR Tasks',
    key: 'RRT',
    category: 'Tasks & Epics',
    type: 'TASK',
    prefix: 'RRT-',
    source: 'Image 1',
    desc: 'Release Readiness (RR) action items, regulatory submission tasks, and deployment sign-offs.'
  },
  {
    index: 90,
    name: 'Tasks',
    key: 'TASK',
    category: 'Tasks & Epics',
    type: 'TASK',
    prefix: 'TASK-',
    source: 'Image 1',
    desc: 'General engineering and project execution tasks, work packages, and cross-discipline milestones.'
  },

  // 14. Changes, Releases & CM (10)
  {
    index: 91,
    name: '079_SW Change Requests',
    key: 'SWCRQ',
    category: 'Changes, Releases & CM',
    type: 'RELEASE',
    prefix: 'SWCRQ-',
    source: 'Image 4',
    desc: 'Software Change Requests: feature scope amendments, API breaking changes, and bug fix requests.'
  },
  {
    index: 92,
    name: 'ChangeRequest',
    key: 'CR',
    category: 'Changes, Releases & CM',
    type: 'RELEASE',
    prefix: 'CR-',
    source: 'Image 4',
    desc: 'Formal Engineering Change Requests (ECR/ECO) evaluating technical impact, BOM cost, and schedule delta.'
  },
  {
    index: 93,
    name: '081_SW Configuration Integration Tickets',
    key: 'SW-CIT',
    category: 'Changes, Releases & CM',
    type: 'RELEASE',
    prefix: 'SW-CIT-',
    source: 'Image 1',
    desc: 'Software configuration integration tickets, build promotions, release tagging, and package verification.'
  },
  {
    index: 94,
    name: 'Components',
    key: 'COMP',
    category: 'Changes, Releases & CM',
    type: 'ARCHITECTURE',
    prefix: 'COMP-',
    source: 'Image 4',
    desc: 'Hardware and software component catalog, revision control, vendor part numbers, and datasheets.'
  },
  {
    index: 95,
    name: 'CM Report',
    key: 'CMR',
    category: 'Changes, Releases & CM',
    type: 'DOCUMENT',
    prefix: 'CMR-',
    source: 'Image 4',
    desc: 'Configuration Management (CM) baseline verification reports, SBOM disclosures, and checksum audits.'
  },
  {
    index: 96,
    name: 'Platforms',
    key: 'PLAT',
    category: 'Changes, Releases & CM',
    type: 'ARCHITECTURE',
    prefix: 'PLAT-',
    source: 'Image 4',
    desc: 'Hardware target architectures, onboard compute carrier boards (Jetson Orin), and low-level MCUs.'
  },
  {
    index: 97,
    name: 'HW Releases',
    key: 'HWR',
    category: 'Changes, Releases & CM',
    type: 'RELEASE',
    prefix: 'HWR-',
    source: 'Image 4',
    desc: 'Hardware design release baselines: PCB Gerber packages, schematic release bundles, and CAD archives.'
  },
  {
    index: 98,
    name: 'Project- Releases',
    key: 'PRJR',
    category: 'Changes, Releases & CM',
    type: 'RELEASE',
    prefix: 'PRJR-',
    source: 'Image 4',
    desc: 'Major project milestone deliveries: Concept Phase, Proto A-Sample, Beta B-Sample, Production C-Sample.'
  },
  {
    index: 99,
    name: 'SW Releases',
    key: 'SWR',
    category: 'Changes, Releases & CM',
    type: 'RELEASE',
    prefix: 'SWR-',
    source: 'Image 4',
    desc: 'Software firmware release builds, debian package repositories, OTA update bundles, and changelogs.'
  },
  {
    index: 100,
    name: 'SystemReleases',
    key: 'SYSR',
    category: 'Changes, Releases & CM',
    type: 'RELEASE',
    prefix: 'SYSR-',
    source: 'Image 4',
    desc: 'Turnkey system releases validated for customer restaurant deployment, with user manuals and certifications.'
  },

  // 15. Project Management & Governance (4)
  {
    index: 101,
    name: '039_Documents',
    key: 'DOC',
    category: 'Project Management & Governance',
    type: 'DOCUMENT',
    prefix: 'DOC-',
    source: 'Image 2',
    desc: 'General project engineering documentation, specifications, contractual agreements, and whitepapers.'
  },
  {
    index: 102,
    name: 'Minutes of Meeting',
    key: 'MoM',
    category: 'Project Management & Governance',
    type: 'DOCUMENT',
    prefix: 'MoM-',
    source: 'Image 1',
    desc: 'Official minutes of meetings: architecture syncs, customer design reviews, and change control boards.'
  },
  {
    index: 103,
    name: 'Contacts',
    key: 'CNT',
    category: 'Project Management & Governance',
    type: 'DOCUMENT',
    prefix: 'CNT-',
    source: 'Image 4',
    desc: 'Project stakeholder directory, engineering leads, component suppliers, and customer representatives.'
  },
  {
    index: 104,
    name: 'Team',
    key: 'TEAM',
    category: 'Project Management & Governance',
    type: 'DOCUMENT',
    prefix: 'TEAM-',
    source: 'Image 4',
    desc: 'Project staffing directory, engineering roles, safety manager designations, and RACI responsibilities.'
  }
];

/**
 * Creates a complete, independent set of all 104 trackers for a specific project.
 * Guaranteed unique tracker IDs per project: `projectId * 1000 + template.index`
 */
export function createProjectTrackers(projectId: number, projectKey: string): Tracker[] {
  const upperKey = projectKey.toUpperCase().trim();
  return CANONICAL_TRACKERS.map(template => {
    return {
      id: projectId * 1000 + template.index,
      project_id: projectId,
      key: template.key,
      name: template.name,
      type: template.type,
      prefix: `${upperKey}-${template.prefix}`,
      object_count: 0,
      enable_test_steps: template.enable_test_steps || false,
      enable_folders: true,
      description: template.desc
    };
  });
}
