import zipfile
import xml.etree.ElementTree as ET
import os
import datetime

# Complete Data for all 104 Trackers
TRACKERS = [
    # 1. Requirements & Verification (11)
    {"no": 1, "name": "020_IRS_Internal_Requirement_Specification", "key": "IRS", "category": "Requirements & Verification", "type": "REQUIREMENT", "source": "Image 3", "desc": "Internal engineering requirements, technical specifications, and internal boundary constraints."},
    {"no": 2, "name": "022_Customer Quality Requirements", "key": "CQR", "category": "Requirements & Verification", "type": "REQUIREMENT", "source": "Image 3", "desc": "Customer-mandated quality metrics, reliability targets, MTBF goals, and warranty expectations."},
    {"no": 3, "name": "023_Customer Requirement Specification SW", "key": "CRSSW", "category": "Requirements & Verification", "type": "REQUIREMENT", "source": "Image 3", "desc": "Customer-specified software features, UI/UX interaction workflows, and mission logic."},
    {"no": 4, "name": "024_Customer Requirement Specification EMC", "key": "CRSEMC", "category": "Requirements & Verification", "type": "REQUIREMENT", "source": "Image 3", "desc": "Customer electromagnetic compatibility standards, emission ceilings, and immunity requirements."},
    {"no": 5, "name": "025_Customer Requirement Specification Test", "key": "CRST", "category": "Requirements & Verification", "type": "REQUIREMENT", "source": "Image 3", "desc": "Customer acceptance testing criteria, test witness requirements, and compliance proof demands."},
    {"no": 6, "name": "027_Customer Requirement Specification ENV", "key": "CRSENV", "category": "Requirements & Verification", "type": "REQUIREMENT", "source": "Image 3", "desc": "Environmental tolerance standards: thermal range, humidity, ingress protection, and shock."},
    {"no": 7, "name": "028_CRS Referenced Documents", "key": "CRSREF", "category": "Requirements & Verification", "type": "DOCUMENT", "source": "Image 3", "desc": "External normative standards, client interface agreements, and customer statements of work."},
    {"no": 8, "name": "031_System Requirement Specification", "key": "SRS", "category": "Requirements & Verification", "type": "REQUIREMENT", "source": "Image 3", "desc": "Master system functional and non-functional requirements governing the complete robot platform."},
    {"no": 9, "name": "0311_Parameter_Specification", "key": "PAR", "category": "Requirements & Verification", "type": "REQUIREMENT", "source": "Image 3", "desc": "Quantitative operating limits, speed limits, payload capacity, sensor tolerances, and thresholds."},
    {"no": 10, "name": "036_System Requirement Verification", "key": "SRV", "category": "Requirements & Verification", "type": "REQUIREMENT", "source": "Image 3", "desc": "Verification method assignment (Test, Analysis, Demo, Inspection) and verification cross-reference matrix."},
    {"no": 11, "name": "0361_System Requirement Verification_old", "key": "SRV", "category": "Requirements & Verification", "type": "REQUIREMENT", "source": "Image 2, Image 3", "desc": "Archived prior verification baselines, legacy qualification criteria, and traceability history."},

    # 2. Safety & Quality Assurance (3)
    {"no": 12, "name": "Risks_SWRS", "key": "RSWRS", "category": "Safety & Quality Assurance", "type": "RISK", "source": "Image 1", "desc": "Software safety risks, ASIL hazard ratings, kinetic collision hazards, and fail-safe mitigations."},
    {"no": 13, "name": "10_Quality Assurance", "key": "QA", "category": "Safety & Quality Assurance", "type": "REQUIREMENT", "source": "Image 3, Image 4", "desc": "Quality assurance gate checklists, ISO 9001 process audits, and peer inspection approvals."},
    {"no": 14, "name": "011_Safetyplan", "key": "SafeP", "category": "Safety & Quality Assurance", "type": "DOCUMENT", "source": "Image 3, Image 4", "desc": "Functional safety management plan, safety lifecycle milestones, and ISO 13482 safety case roadmap."},

    # 3. System Architecture & Engineering (8)
    {"no": 15, "name": "030_Systems Engineering Strategie", "key": "SYS_STRATEGY", "category": "System Architecture & Engineering", "type": "DOCUMENT", "source": "Image 3", "desc": "V-model systems engineering strategy, milestone review gates, and decomposition architecture."},
    {"no": 16, "name": "0312_COM Matrix", "key": "COM", "category": "System Architecture & Engineering", "type": "ARCHITECTURE", "source": "Image 3", "desc": "CAN bus 2.0B, Ethernet, and ROS2 DDS topic/service message dictionary and communication frame layout."},
    {"no": 17, "name": "0313_Diagnostic_Services", "key": "DS", "category": "System Architecture & Engineering", "type": "ARCHITECTURE", "source": "Image 3", "desc": "Unified Diagnostic Services (UDS / ISO 14229) definitions, session management, and routine control."},
    {"no": 18, "name": "0314_FaultCodeList", "key": "FC", "category": "System Architecture & Engineering", "type": "ARCHITECTURE", "source": "Image 3", "desc": "Diagnostic Trouble Codes (DTC), fault detection debounce rules, warning chime triggers, and safe states."},
    {"no": 19, "name": "032_System Architectural Design", "key": "SAD", "category": "System Architecture & Engineering", "type": "ARCHITECTURE", "source": "Image 3", "desc": "Physical, mechanical, and electrical decomposition into Mobility, Payload, Sensors, and Compute subsystems."},
    {"no": 20, "name": "033_TCI", "key": "TCI", "category": "System Architecture & Engineering", "type": "ARCHITECTURE", "source": "Image 3", "desc": "Technical Customer Interface (TCI) specifications, telemetry push APIs, and remote dispatch endpoints."},
    {"no": 21, "name": "034_Hardware-Software-Interface", "key": "HSI", "category": "System Architecture & Engineering", "type": "ARCHITECTURE", "source": "Image 3", "desc": "Hardware-Software Interface (HSI) register maps, GPIO assignments, ADC channels, and HAL drivers."},
    {"no": 22, "name": "038_SYS Design", "key": "SYSD", "category": "System Architecture & Engineering", "type": "ARCHITECTURE", "source": "Image 2", "desc": "High-level cyber-physical systems design specifications and multi-domain engineering blueprints."},

    # 4. Hardware & Electronics Engineering (12)
    {"no": 23, "name": "04_Electrical (EM) Design", "key": "EMD", "category": "Hardware & Electronics", "type": "ARCHITECTURE", "source": "Image 2", "desc": "Power distribution unit (48V / 24V / 5V DC), battery management system, wiring harnesses, and fusing."},
    {"no": 24, "name": "041_Mechanical Design", "key": "MD", "category": "Hardware & Electronics", "type": "ARCHITECTURE", "source": "Image 2", "desc": "Mobile chassis, differential drive suspension, insulated food compartment, and structural enclosures."},
    {"no": 25, "name": "051_HW Requirements Specification", "key": "HWRS", "category": "Hardware & Electronics", "type": "REQUIREMENT", "source": "Image 2", "desc": "Component-level hardware specifications, PCB operating temperatures, power dissipation, and load limits."},
    {"no": 26, "name": "052_HW Architectural Design", "key": "HWAD", "category": "Hardware & Electronics", "type": "ARCHITECTURE", "source": "Image 2", "desc": "Microcontroller topology (STM32 / TI), safety microcontroller redundancy, and motor drive controllers."},
    {"no": 27, "name": "053_HW Detailed Design", "key": "HWDD", "category": "Hardware & Electronics", "type": "ARCHITECTURE", "source": "Image 2", "desc": "Detailed electronic circuit schematics, bill of materials (BOM), Altium PCB layouts, and component pinouts."},
    {"no": 28, "name": "054A_EMC Test Plan DV", "key": "EMC_DV", "category": "Hardware & Electronics", "type": "TEST_SPEC", "source": "Image 2", "desc": "Design Verification (DV) test protocol for conducted and radiated electromagnetic compatibility emissions."},
    {"no": 29, "name": "054B_EMC Test Report DV", "key": "EMC_RPT", "category": "Hardware & Electronics", "type": "TEST_SPEC", "source": "Image 2", "desc": "Design Verification (DV) test results, anechoic chamber plots, immunity thresholds, and corrective fixes."},
    {"no": 30, "name": "054C_EMC Test Plan PV", "key": "EMC_PV", "category": "Hardware & Electronics", "type": "TEST_SPEC", "source": "Image 2", "desc": "Production Validation (PV) electromagnetic compatibility validation plan for mass production units."},
    {"no": 31, "name": "054D_EMV Test Report PV", "key": "EMV_RPT", "category": "Hardware & Electronics", "type": "TEST_SPEC", "source": "Image 2", "desc": "Production Validation (PV) certified EMC/EMV test reports and regulatory compliance certificates."},
    {"no": 32, "name": "057_HW Design Verification", "key": "HWDV", "category": "Hardware & Electronics", "type": "TEST_SPEC", "source": "Image 2", "desc": "Hardware design review compliance matrix, derating analysis, and thermal simulation verification."},
    {"no": 33, "name": "061_HW Test Plan", "key": "HWTP", "category": "Hardware & Electronics", "type": "TEST_SPEC", "source": "Image 2", "desc": "Comprehensive hardware bench, power cycling, overvoltage, short circuit, and stress test plan."},
    {"no": 34, "name": "062_HW Test Report", "key": "HWTR", "category": "Hardware & Electronics", "type": "TEST_SPEC", "source": "Image 2", "desc": "Hardware bench test results, oscilloscope captures, thermal camera imaging, and engineer sign-offs."},

    # 5. Software Engineering & Architecture (5)
    {"no": 35, "name": "070_High level SW requirements", "key": "HLSW", "category": "Software Engineering & Architecture", "type": "REQUIREMENT", "source": "Image 2", "desc": "High-level software use cases, robot fleet coordination, table mapping, and mission planners."},
    {"no": 36, "name": "071_SW Requirements Specification", "key": "SWRS", "category": "Software Engineering & Architecture", "type": "REQUIREMENT", "source": "Image 2", "desc": "Detailed software requirement specifications, dynamic obstacle avoidance logic, and DWB local planner specs."},
    {"no": 37, "name": "0711_Software customer topic list", "key": "SWCTL", "category": "Software Engineering & Architecture", "type": "REQUIREMENT", "source": "Image 2", "desc": "Client-requested software customization requests, kitchen POS system integration hooks, and feature wishlists."},
    {"no": 38, "name": "072_SW Architectural Design", "key": "SWAD", "category": "Software Engineering & Architecture", "type": "ARCHITECTURE", "source": "Image 2", "desc": "ROS2 node graph, micro-ROS firmware architecture, sensor fusion pipeline, and DDS middleware layout."},
    {"no": 39, "name": "073_SW Detailed Design", "key": "SWDD", "category": "Software Engineering & Architecture", "type": "ARCHITECTURE", "source": "Image 2", "desc": "Software module class diagrams, state machine transitions, algorithm pseudocode, and thread models."},

    # 6. Test Specifications & Strategy (7)
    {"no": 40, "name": "066_Hardware Software Integration Testplan", "key": "HSITP", "category": "Test Specifications & Strategy", "type": "TEST_SPEC", "source": "Image 2", "desc": "Integration test plan verifying motor controller firmware, CAN bus latency, and sensor driver communications."},
    {"no": 41, "name": "121_Design Verification Plan (B-Samples)", "key": "DVP_B", "category": "Test Specifications & Strategy", "type": "TEST_SPEC", "source": "Image 4", "desc": "Phase B prototype engineering design verification plan covering environmental, stress, and functional criteria."},
    {"no": 42, "name": "123_Product Validation Plan (C-Samples)", "key": "PVP_C", "category": "Test Specifications & Strategy", "type": "TEST_SPEC", "source": "Image 4", "desc": "Phase C pilot-production validation plan verifying end-to-end reliability and manufacturing yield."},
    {"no": 43, "name": "127_System Qualification Test Specification", "key": "SQTSPEC", "category": "Test Specifications & Strategy", "type": "TEST_SPEC", "source": "Image 3, Image 4", "desc": "Formal system qualification test procedures validating adherence to ISO 13482 safety requirements."},
    {"no": 44, "name": "133_System Integration and Integration Test Specification", "key": "SIITS", "category": "Test Specifications & Strategy", "type": "TEST_SPEC", "source": "Image 3", "desc": "Multi-subsystem integration procedures verifying simultaneous motion, obstacle evasion, and thermal hold."},
    {"no": 45, "name": "161_Mechanical Qualification Test Plan", "key": "MQTP", "category": "Test Specifications & Strategy", "type": "TEST_SPEC", "source": "Image 3", "desc": "Chassis drop test, dynamic vibration, payload bay spill resistance, and door latch endurance test protocols."},
    {"no": 46, "name": "System Test Strategy RR4x", "key": "STS RR4x", "category": "Test Specifications & Strategy", "type": "TEST_SPEC", "source": "Image 4", "desc": "System-wide test coverage strategy, verification gates, and release qualification criteria for RR4x milestone."},

    # 7. Test Cases (8)
    {"no": 47, "name": "0761_Test Engineering Cases", "key": "TEC", "category": "Test Cases", "type": "TEST_CASE", "source": "Image 4", "desc": "Engineering test cases verifying low-level bus voltage, optical sensor tripwire timings, and watchdog resets."},
    {"no": 48, "name": "0941_Test Cases Software Qualification Test", "key": "TCSQT_C", "category": "Test Cases", "type": "TEST_CASE", "source": "Image 4", "desc": "Formal software qualification test cases with inputs, preconditions, expected outputs, and pass criteria."},
    {"no": 49, "name": "0951_Test Cases Software Integration Test", "key": "TCSIT_C", "category": "Test Cases", "type": "TEST_CASE", "source": "Image 4", "desc": "Integration test cases verifying ROS2 inter-node topic streaming, localization accuracy, and cmd_vel twists."},
    {"no": 50, "name": "0961_Test Cases Software Unit Test", "key": "TCSUT_C", "category": "Test Cases", "type": "TEST_CASE", "source": "Image 4", "desc": "Algorithmic unit test cases testing costmap inflation calculations, path smoothing, and thermal PID algorithms."},
    {"no": 51, "name": "371_Test Cases Hardware Qualification Test", "key": "TCHWT", "category": "Test Cases", "type": "TEST_CASE", "source": "Image 3, Image 5", "desc": "Hardware qualification test cases: thermal chamber load, ESD contact discharge, and mechanical shock."},
    {"no": 52, "name": "372_Test Cases Integration Test", "key": "TCIT", "category": "Test Cases", "type": "TEST_CASE", "source": "Image 3, Image 5", "desc": "Subsystem-to-subsystem integration test cases for CAN bus failover, LiDAR dropout handling, and e-stop trip."},
    {"no": 53, "name": "Reliability Test", "key": "REL", "category": "Test Cases", "type": "TEST_CASE", "source": "Image 3, Image 5", "desc": "Continuous 500-hour stress run test cases, wheel tire wear measurements, and battery cycle degradation."},
    {"no": 54, "name": "Test Cases", "key": "TESTCASE", "category": "Test Cases", "type": "TEST_CASE", "source": "Image 3, Image 5", "desc": "Universal test case library supporting step-by-step action sequences, expected outcomes, and parameters."},

    # 8. Test Configurations (7)
    {"no": 55, "name": "0763_Test Engineering Configuration", "key": "ETCG", "category": "Test Configurations", "type": "TEST_CONFIG", "source": "Image 3, Image 5", "desc": "Engineering test bench hardware setup, power supplies, CAN sniffer configurations, and harness pinouts."},
    {"no": 56, "name": "0942_Test Configurations Software Qualification Test", "key": "TCSQT", "category": "Test Configurations", "type": "TEST_CONFIG", "source": "Image 3, Image 5", "desc": "Software qualification environment settings, test node environments, and automated test runner params."},
    {"no": 57, "name": "0952_Test Configurations Software Integration Test", "key": "TCSIT", "category": "Test Configurations", "type": "TEST_CONFIG", "source": "Image 3, Image 5", "desc": "Software-in-the-Loop (SIL) simulation world profiles, Gazebo restaurant floor models, and obstacle rigs."},
    {"no": 58, "name": "0962_Test Configurations Software Unit Test", "key": "TCSUT", "category": "Test Configurations", "type": "TEST_CONFIG", "source": "Image 3, Image 5", "desc": "Unit test framework flags, gtest / pytest runner configurations, and sanitizers (ASan/UBSan)."},
    {"no": 59, "name": "129_System Qualification Test Configurations", "key": "SQTC", "category": "Test Configurations", "type": "TEST_CONFIG", "source": "Image 3, Image 5", "desc": "Full-scale physical test pen configurations, optical motion capture tracking grids, and mannequin fixtures."},
    {"no": 60, "name": "381_Test Configurations Hardware Qualification Test", "key": "TC_HW_T", "category": "Test Configurations", "type": "TEST_CONFIG", "source": "Image 3, Image 5", "desc": "Environmental chamber thermal profiles (-10C to +55C), vibration shaker profiles, and power load profiles."},
    {"no": 61, "name": "382_Test Configurations Integration Test", "key": "TCIT_CFG", "category": "Test Configurations", "type": "TEST_CONFIG", "source": "Image 3, Image 5", "desc": "Hardware-in-the-Loop (HIL) wiring setups, bus fault injection rigs, and simulated wheel speed encoders."},

    # 9. Test Sets (8)
    {"no": 62, "name": "0762_Test Engineering Sets", "key": "ETS", "category": "Test Sets", "type": "TEST_SET", "source": "Image 3, Image 5", "desc": "Diagnostic test case collections batched together for automated daily CI engineering smoke tests."},
    {"no": 63, "name": "0943_Test Sets Software Qualification Test", "key": "TSSQT", "category": "Test Sets", "type": "TEST_SET", "source": "Image 3, Image 5", "desc": "Official software qualification test set packages required for software release sign-off."},
    {"no": 64, "name": "0953_Test Sets Software Integration Test", "key": "ISSIT", "category": "Test Sets", "type": "TEST_SET", "source": "Image 3, Image 5", "desc": "Nightly regression test suites verifying cross-subsystem interface compatibility."},
    {"no": 65, "name": "0963_Test Sets Software Unit Test", "key": "TSSUT", "category": "Test Sets", "type": "TEST_SET", "source": "Image 3, Image 5", "desc": "Batched code unit test suites enforcing strict >90% branch and statement coverage."},
    {"no": 66, "name": "128_System Qualification Test Sets", "key": "SQTS", "category": "Test Sets", "type": "TEST_SET", "source": "Image 3, Image 5", "desc": "System-level test suites mapped directly to ISO 13482 safety requirements and customer PRDs."},
    {"no": 67, "name": "135_System Integration Test Sets", "key": "SITS", "category": "Test Sets", "type": "TEST_SET", "source": "Image 3, Image 5", "desc": "Integration test packages executed on fully assembled prototype robots on test courses."},
    {"no": 68, "name": "391_Test Sets Hardware Qualification Test", "key": "TSSST", "category": "Test Sets", "type": "TEST_SET", "source": "Image 5", "desc": "Hardware environmental, electrical stress, and thermal qualification test suites."},
    {"no": 69, "name": "392_Test Sets Integration Test", "key": "TSIT", "category": "Test Sets", "type": "TEST_SET", "source": "Image 5", "desc": "Combined hardware-software integration test suites run during sprint stabilization."},

    # 10. Test Runs & Execution (2)
    {"no": 70, "name": "130_System Qualification Test Runs", "key": "SQTR", "category": "Test Runs & Execution", "type": "TEST_RUN", "source": "Image 1", "desc": "System qualification test run execution records, step-by-step pass/fail verdicts, and sensor logs."},
    {"no": 71, "name": "Test Runs", "key": "TESTRUN", "category": "Test Runs & Execution", "type": "TEST_RUN", "source": "Image 1", "desc": "Global test run execution ledger containing run duration, tester signature, and test evidence attachments."},

    # 11. Test Tasks & Reviews (5)
    {"no": 72, "name": "063_HW Tests", "key": "HWT", "category": "Test Tasks & Reviews", "type": "TEST_TASK", "source": "Image 4", "desc": "Hardware testing tasks assigned to electrical test technicians and validation engineers."},
    {"no": 73, "name": "065_HW Test Tasks", "key": "HWTT", "category": "Test Tasks & Reviews", "type": "TEST_TASK", "source": "Image 1", "desc": "Specific test execution tasks for environmental chambers, vibration shakers, and power benches."},
    {"no": 74, "name": "091_SW Test Tasks", "key": "SWT", "category": "Test Tasks & Reviews", "type": "TEST_TASK", "source": "Image 4", "desc": "Software testing tasks for test plan writing, test case authoring, and automated CI test script creation."},
    {"no": 75, "name": "092_SW Test Reviews", "key": "SWTR", "category": "Test Tasks & Reviews", "type": "TEST_TASK", "source": "Image 4", "desc": "Peer reviews of test specifications, test step criteria, test coverage audits, and quality approvals."},
    {"no": 76, "name": "System Test Task", "key": "SysTest Task", "category": "Test Tasks & Reviews", "type": "TEST_TASK", "source": "Image 4", "desc": "System validation task assignments, course setup tasks, mannequin positioning, and data acquisition."},

    # 12. Defects, Failures & Problem Reports (5)
    {"no": 77, "name": "055_HW Failures", "key": "HWBUG", "category": "Defects & Problems", "type": "DEFECT", "source": "Image 4", "desc": "Hardware component defects, PCB solder joint cracks, motor overheating, and sensor disconnects."},
    {"no": 78, "name": "064_HW Testing Failures", "key": "HWTF", "category": "Defects & Problems", "type": "DEFECT", "source": "Image 4", "desc": "Anomalies and failures detected specifically during environmental, thermal, and stress test campaigns."},
    {"no": 79, "name": "075_SW Bugs", "key": "SWBUG", "category": "Defects & Problems", "type": "DEFECT", "source": "Image 4", "desc": "Software defects: segmentation faults, ROS2 node crashes, navigation path oscillations, and latency spikes."},
    {"no": 80, "name": "Problem Report", "key": "PR", "category": "Defects & Problems", "type": "DEFECT", "source": "Image 4", "desc": "Formal Engineering Problem Reports (PR) detailing defect symptoms, root causes, and containment actions."},
    {"no": 81, "name": "Problem Report Octane", "key": "PRO", "category": "Defects & Problems", "type": "DEFECT", "source": "Image 4", "desc": "Synchronized enterprise defect tracker interfacing external ALM / Micro Focus Octane systems."},

    # 13. Tasks & Epics (9)
    {"no": 82, "name": "037_SYS Tasks", "key": "SYS_TASK", "category": "Tasks & Epics", "type": "TASK", "source": "Image 1", "desc": "System engineering tasks: requirement decomposition, trade studies, safety reviews, and interface audits."},
    {"no": 83, "name": "056_HW Tasks", "key": "HWTASK", "category": "Tasks & Epics", "type": "TASK", "source": "Image 1", "desc": "Hardware design tasks: component selection, PCB schematic drafting, CAD revisions, and harness routing."},
    {"no": 84, "name": "074_SW Tasks", "key": "SWTASK", "category": "Tasks & Epics", "type": "TASK", "source": "Image 1", "desc": "Software sprint tasks: driver development, navigation parameter tuning, and UI dashboard enhancements."},
    {"no": 85, "name": "0741 SW Epic", "key": "SWEPIC", "category": "Tasks & Epics", "type": "TASK", "source": "Image 4", "desc": "Major software epic initiatives: Autonomous Fleet Management, ISO 13482 Safety Stack, Nav2 Migration."},
    {"no": 86, "name": "143_QAD Tasks (Old Version)", "key": "QAD_T_OLD", "category": "Tasks & Epics", "type": "TASK", "source": "Image 1", "desc": "Archived quality assurance tasks and legacy process audit items."},
    {"no": 87, "name": "143_QAD Tasks (XNF)", "key": "QAD_T", "category": "Tasks & Epics", "type": "TASK", "source": "Image 4", "desc": "Active quality assurance department tasks, vendor quality checks, and production line audit tasks."},
    {"no": 88, "name": "144_QAD Epic", "key": "QADEPIC", "category": "Tasks & Epics", "type": "TASK", "source": "Image 4", "desc": "Quality assurance strategic epics: Supplier Quality Qualification, Cleanroom Standards, Process Capability."},
    {"no": 89, "name": "RR Tasks", "key": "RRT", "category": "Tasks & Epics", "type": "TASK", "source": "Image 1", "desc": "Release Readiness (RR) action items, regulatory submission tasks, and deployment sign-offs."},
    {"no": 90, "name": "Tasks", "key": "TASK", "category": "Tasks & Epics", "type": "TASK", "source": "Image 1", "desc": "General engineering and project execution tasks, work packages, and cross-discipline milestones."},

    # 14. Changes, Releases & CM (10)
    {"no": 91, "name": "079_SW Change Requests", "key": "SWCRQ", "category": "Changes, Releases & CM", "type": "RELEASE", "source": "Image 4", "desc": "Software Change Requests: feature scope amendments, API breaking changes, and bug fix requests."},
    {"no": 92, "name": "ChangeRequest", "key": "CR", "category": "Changes, Releases & CM", "type": "RELEASE", "source": "Image 4", "desc": "Formal Engineering Change Requests (ECR/ECO) evaluating technical impact, BOM cost, and schedule delta."},
    {"no": 93, "name": "081_SW Configuration Integration Tickets", "key": "SW-CIT", "category": "Changes, Releases & CM", "type": "RELEASE", "source": "Image 1", "desc": "Software configuration integration tickets, build promotions, release tagging, and package verification."},
    {"no": 94, "name": "Components", "key": "COMP", "category": "Changes, Releases & CM", "type": "ARCHITECTURE", "source": "Image 4", "desc": "Hardware and software component catalog, revision control, vendor part numbers, and datasheets."},
    {"no": 95, "name": "CM Report", "key": "CMR", "category": "Changes, Releases & CM", "type": "DOCUMENT", "source": "Image 4", "desc": "Configuration Management (CM) baseline verification reports, SBOM disclosures, and checksum audits."},
    {"no": 96, "name": "Platforms", "key": "PLAT", "category": "Changes, Releases & CM", "type": "ARCHITECTURE", "source": "Image 4", "desc": "Hardware target architectures, onboard compute carrier boards (Jetson Orin), and low-level MCUs."},
    {"no": 97, "name": "HW Releases", "key": "HWR", "category": "Changes, Releases & CM", "type": "RELEASE", "source": "Image 4", "desc": "Hardware design release baselines: PCB Gerber packages, schematic release bundles, and CAD archives."},
    {"no": 98, "name": "Project- Releases", "key": "PRJR", "category": "Changes, Releases & CM", "type": "RELEASE", "source": "Image 4", "desc": "Major project milestone deliveries: Concept Phase, Proto A-Sample, Beta B-Sample, Production C-Sample."},
    {"no": 99, "name": "SW Releases", "key": "SWR", "category": "Changes, Releases & CM", "type": "RELEASE", "source": "Image 4", "desc": "Software firmware release builds, debian package repositories, OTA update bundles, and changelogs."},
    {"no": 100, "name": "SystemReleases", "key": "SYSR", "category": "Changes, Releases & CM", "type": "RELEASE", "source": "Image 4", "desc": "Turnkey system releases validated for customer restaurant deployment, with user manuals and certifications."},

    # 15. Project Management & Governance (4)
    {"no": 101, "name": "039_Documents", "key": "DOC", "category": "Project Management & Governance", "type": "DOCUMENT", "source": "Image 2", "desc": "General project engineering documentation, specifications, contractual agreements, and whitepapers."},
    {"no": 102, "name": "Minutes of Meeting", "key": "MoM", "category": "Project Management & Governance", "type": "DOCUMENT", "source": "Image 1", "desc": "Official minutes of meetings: architecture syncs, customer design reviews, and change control boards."},
    {"no": 103, "name": "Contacts", "key": "CNT", "category": "Project Management & Governance", "type": "DOCUMENT", "source": "Image 4", "desc": "Project stakeholder directory, engineering leads, component suppliers, and customer representatives."},
    {"no": 104, "name": "Team", "key": "TEAM", "category": "Project Management & Governance", "type": "DOCUMENT", "source": "Image 4", "desc": "Project staffing directory, engineering roles, safety manager designations, and RACI responsibilities."}
]

print(f"Total Trackers to encode: {len(TRACKERS)}")

def escape_xml(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&apos;")

# Generate Word Document OpenXML structure
def build_docx(filename):
    # Category summary
    from collections import Counter
    cat_counts = Counter(t["category"] for t in TRACKERS)

    # Document body XML
    body_xml = []
    
    # Title Paragraph
    body_xml.append('''
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="360" w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:b/>
          <w:sz w:val="52"/>
          <w:color w:val="1E293B"/>
        </w:rPr>
        <w:t>Engineering Lifecycle Management (ELM)</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="0" w:after="300"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:b/>
          <w:sz w:val="32"/>
          <w:color w:val="0EA5E9"/>
        </w:rPr>
        <w:t>Master Inventory of All 104 Engineering Trackers</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="0" w:after="400"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:i/>
          <w:sz w:val="22"/>
          <w:color w:val="64748B"/>
        </w:rPr>
        <w:t>Comprehensive specification derived from Codebeamer ELM / ALM platform | Generated October 2026</w:t>
      </w:r>
    </w:p>
    ''')

    # Executive Overview
    body_xml.append('''
    <w:p>
      <w:pPr>
        <w:spacing w:before="240" w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:b/>
          <w:sz w:val="28"/>
          <w:color w:val="0F172A"/>
        </w:rPr>
        <w:t>1. Executive Summary &amp; Category Breakdown</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:spacing w:before="60" w:after="160"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:sz w:val="22"/>
          <w:color w:val="334155"/>
        </w:rPr>
        <w:t>This document catalogs the complete structure of 104 independent engineering trackers required across all cyber-physical robotics and automotive ELM projects. Each project maintains its own isolated, autonomous tracker instances ensuring zero cross-project leakage.</w:t>
      </w:r>
    </w:p>
    ''')

    # Category Summary Table
    body_xml.append('''
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9600" w:type="dxa"/>
        <w:jc w:val="center"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:left w:val="none"/>
          <w:bottom w:val="single" w:sz="12" w:space="0" w:color="0EA5E9"/>
          <w:right w:val="none"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:trPr><w:tblHeader/></w:trPr>
        <w:tc>
          <w:tcPr><w:tcW w:w="1200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/></w:rPr><w:t>No.</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="5400" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/></w:rPr><w:t>Engineering Domain / Functional Category</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="3000" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/></w:rPr><w:t>Trackers Count</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    ''')

    for idx, (cat, count) in enumerate(cat_counts.items(), 1):
        bg = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        body_xml.append(f'''
        <w:tr>
          <w:tc>
            <w:tcPr><w:tcW w:w="1200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/></w:tcPr>
            <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr><w:t>{idx}</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:tcPr><w:tcW w:w="5400" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/></w:tcPr>
            <w:p><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="1E293B"/></w:rPr><w:t>{escape_xml(cat)}</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:tcPr><w:tcW w:w="3000" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/></w:tcPr>
            <w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="0EA5E9"/></w:rPr><w:t>{count} trackers</w:t></w:r></w:p>
          </w:tc>
        </w:tr>
        ''')

    # Total row
    body_xml.append(f'''
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="1200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>Σ</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="5400" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>TOTAL TRACKERS</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="3000" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="0EA5E9"/></w:rPr><w:t>104 Trackers</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
    ''')

    # Master Table Header
    body_xml.append('''
    <w:p>
      <w:pPr>
        <w:spacing w:before="400" w:after="140"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:b/>
          <w:sz w:val="28"/>
          <w:color w:val="0F172A"/>
        </w:rPr>
        <w:t>2. Complete Master Inventory of 104 Trackers</w:t>
      </w:r>
    </w:p>
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9600" w:type="dxa"/>
        <w:jc w:val="center"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="8" w:space="0" w:color="0EA5E9"/>
          <w:left w:val="none"/>
          <w:bottom w:val="single" w:sz="8" w:space="0" w:color="0EA5E9"/>
          <w:right w:val="none"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:trPr><w:tblHeader/></w:trPr>
        <w:tc>
          <w:tcPr><w:tcW w:w="600" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>#</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="3000" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Tracker Name</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="1200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Key / Code</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="1800" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Category &amp; Type</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="3000" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Engineering Scope &amp; Purpose</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    ''')

    for t in TRACKERS:
        bg = "F8FAFC" if t["no"] % 2 == 0 else "FFFFFF"
        body_xml.append(f'''
        <w:tr>
          <w:tc>
            <w:tcPr><w:tcW w:w="600" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/></w:tcPr>
            <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="17"/><w:color w:val="64748B"/></w:rPr><w:t>{t['no']}</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:tcPr><w:tcW w:w="3000" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/></w:tcPr>
            <w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="0F172A"/></w:rPr><w:t>{escape_xml(t['name'])}</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:tcPr><w:tcW w:w="1200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/></w:tcPr>
            <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:b/><w:sz w:val="17"/><w:color w:val="0284C7"/></w:rPr><w:t>{escape_xml(t['key'])}</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:tcPr><w:tcW w:w="1800" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/></w:tcPr>
            <w:p>
              <w:r><w:rPr><w:b/><w:sz w:val="17"/><w:color w:val="334155"/></w:rPr><w:t>{escape_xml(t['category'])}</w:t></w:r>
            </w:p>
            <w:p>
              <w:r><w:rPr><w:i/><w:sz w:val="15"/><w:color w:val="64748B"/></w:rPr><w:t>[{escape_xml(t['type'])}] • {escape_xml(t['source'])}</w:t></w:r>
            </w:p>
          </w:tc>
          <w:tc>
            <w:tcPr><w:tcW w:w="3000" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/></w:tcPr>
            <w:p><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="334155"/></w:rPr><w:t>{escape_xml(t['desc'])}</w:t></w:r></w:p>
          </w:tc>
        </w:tr>
        ''')

    body_xml.append('</w:tbl>')

    # Complete Document XML
    doc_xml_str = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        {''.join(body_xml)}
        <w:sectPr>
          <w:pgSz w:w="12240" w:h="15840"/>
          <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/>
        </w:sectPr>
      </w:body>
    </w:document>
    '''

    # Package files
    content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
      <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
    </Types>'''

    root_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
      <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
      <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
    </Relationships>'''

    doc_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    </Relationships>'''

    core_props = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">
      <dc:title>Engineering Lifecycle Management (ELM) - Complete Trackers Inventory</dc:title>
      <dc:creator>RoboServ Engineering Platform</dc:creator>
      <cp:lastModifiedBy>RoboServ Systems Team</cp:lastModifiedBy>
      <dcterms:created>{datetime.datetime.utcnow().isoformat()}Z</dcterms:created>
      <dcterms:modified>{datetime.datetime.utcnow().isoformat()}Z</dcterms:modified>
    </cp:coreProperties>'''

    app_props = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
      <Application>Microsoft Word</Application>
      <DocSecurity>0</DocSecurity>
      <Lines>104</Lines>
      <Paragraphs>250</Paragraphs>
    </Properties>'''

    with zipfile.ZipFile(filename, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', content_types)
        z.writestr('_rels/.rels', root_rels)
        z.writestr('word/document.xml', doc_xml_str)
        z.writestr('word/_rels/document.xml.rels', doc_rels)
        z.writestr('docProps/core.xml', core_props)
        z.writestr('docProps/app.xml', app_props)

    print(f"Successfully generated Word document: {filename} ({os.path.getsize(filename):,} bytes)")

if __name__ == '__main__':
    target = 'All_104_Engineering_Trackers_Inventory.docx'
    build_docx(target)
