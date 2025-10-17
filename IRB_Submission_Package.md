# IRB Submission Package
## EQR AI-Integrated Surgical System Clinical Study
**Protocol Version 1.0 - Submission Ready**

---

## Table of Contents

1. [Protocol Summary](#protocol-summary)
2. [Research Protocol](#research-protocol)
3. [Informed Consent Form](#informed-consent-form)
4. [Investigator Brochure](#investigator-brochure)
5. [Data Safety Monitoring Plan](#data-safety-monitoring-plan)
6. [Case Report Forms (CRFs)](#case-report-forms)
7. [Regulatory Documents](#regulatory-documents)

---

## 1. Protocol Summary

### Study Title
**Prospective Observational Study of AI-Integrated Visualization and Knowledge Assistance During Robotic Endoscopic Submucosal Dissection**

### Short Title
**AI-Assisted ESD Pilot Study**

### Protocol ID
**EQR-AI-ESD-2025-001**

### Study Phase
**Pilot Clinical Validation (Pre-510(k) Submission)**

### Sponsor
**EQR Surgical Robotics, Inc.**  
[Address]  
[Contact Information]

### Principal Investigator
**[Name], MD, FACS**  
Department of Surgery  
[PARADIGM Institution]  
[Contact Information]

### Study Duration (REVISED)
- **Enrollment Period:** 18 months (55 weeks) ← **REVISED from 12 months**
- **Per-Patient Duration:** Single surgical procedure + 30-day follow-up
- **Total Study Duration:** 21 months (enrollment + follow-up + analysis) ← **REVISED from 15 months**
- **Phase 1 Feasibility:** Week 21-24 (First 10 cases for safety validation)

### Study Design (REVISED)
- **Type:** Prospective observational, single-arm study
- **Control:** Historical controls (pre-AI cohort, retrospective chart review)
- **Sample Size:** 100 patients (AI-assisted group) ← **REVISED from N=60**
- **Historical Controls:** 100 patients (standard ESD without AI, 2023-2024 data) ← **REVISED from N=60**
- **Enrollment Rate:** 5 cases/month (realistic rate for 2-site study)

### Primary Objective
Evaluate the clinical performance and safety of the EQR AI-Integrated Surgical System during robotic endoscopic submucosal dissection procedures.

### Primary Endpoint
**Tissue identification time** (seconds) - Time from tissue exposure to confident identification by surgeon
- **Measurement:** Video timestamp analysis (objective, blinded reviewer)
- **Hypothesis:** 30% reduction in AI-assisted group vs. historical controls
- **Statistical Power:** N=86 required (alpha=0.05, power=0.90) → N=100 planned (15% dropout buffer) ← **REVISED from N=60 (power=0.80)**

### Secondary Endpoints
1. **Safety:** Adverse events (intraoperative complications, 30-day postoperative complications)
2. **Efficiency:** Total operative time, estimated blood loss, instrument exchanges
3. **Usability:** System Usability Scale (SUS), NASA-TLX workload assessment
4. **Surgeon Satisfaction:** Custom 5-point Likert scale questionnaire

### Key Inclusion Criteria
- Age ≥18 years
- Scheduled for robotic ESD (colorectal or gastric lesions)
- Lesion size 2-5 cm (complex enough to benefit from AI)
- ASA class I-III
- Able to provide informed consent

### Key Exclusion Criteria
- Emergency procedures
- Prior radiation therapy to surgical site (distorted anatomy)
- Coagulopathy (INR >1.5, platelets <50K)
- Pregnant or breastfeeding
- Inability to consent

### Device Classification
- **FDA Classification:** Non-Significant Risk (NSR) device
- **Rationale:** Advisory system only, no autonomous robot control, surgeon retains full authority

---

## 2. Research Protocol

### 2.1 Background and Rationale

#### 2.1.1 Clinical Need
Endoscopic submucosal dissection (ESD) is a minimally invasive technique for removing early-stage gastrointestinal lesions. While robotics improves dexterity compared to flexible endoscopy, surgeons face three major challenges:

1. **Visualization Difficulty (60-80% of cases):** Bleeding or tissue obscures the surgical field, requiring frequent interruptions for field clearing. This adds 10-15 minutes to operative time and increases perforation risk when surgeons operate "blind."

2. **Tissue Differentiation (40-50% of complex cases):** Distinguishing between critical structures (blood vessels, muscle layer, serosa) and dissection planes is mentally demanding. Misidentification can lead to bleeding (vessel injury) or perforation (through-wall injury).

3. **Documentation Burden (100% of cases):** FDA regulatory requirements for robotic procedures mandate detailed operative notes, device performance logs, and complication reporting. Surgeons spend 15-20 minutes post-procedure on documentation.

#### 2.1.2 Proposed Solution
The EQR AI-Integrated Surgical System addresses these pain points through a 3-tier architecture:

- **Tier 1 (Real-Time Vision):** YOLOv8 + SAM computer vision models provide color-coded tissue overlays (vessels=red, muscle=blue, lesion=green) with confidence indicators. Latency: 35ms (non-critical advisory).

- **Tier 2 (Knowledge Assistant):** On-device GPT-4o-mini responds to voice queries ("Is this the submucosa?") with visual examples from 1,000 prior ESD cases. Latency: 1-2 seconds.

- **Tier 3 (Documentation):** Cloud-based GPT-5 Pro auto-generates operative notes from surgical video + voice dictation, reducing documentation time by 60% (20 min → 8 min).

**Critically:** The AI system is **advisory only**. Surgeons retain full control of the robot. A hardware safety layer (FPGA-based emergency stop, <2ms latency) operates independently of all AI functions.

#### 2.1.3 Regulatory Strategy
This study is designed to support FDA 510(k) clearance with a **Predetermined Change Control Plan (PCCP)**. PCCP allows continuous AI model updates within predefined boundaries without new 510(k) submissions. This study will validate:
- Safety: AI does not increase adverse events
- Performance: AI improves tissue identification time (primary endpoint)
- Usability: Surgeons find the system intuitive (SUS ≥75/100)

### 2.2 Study Objectives

#### 2.2.1 Primary Objective
Demonstrate that AI-assisted robotic ESD reduces tissue identification time by ≥30% compared to historical controls without AI assistance.

#### 2.2.2 Secondary Objectives
1. **Safety:** Confirm non-inferiority for intraoperative adverse events (bleeding, perforation) and 30-day complications (infection, stricture)
2. **Efficiency:** Assess impact on total operative time, estimated blood loss, and instrument exchanges
3. **Usability:** Evaluate surgeon acceptance and cognitive workload
4. **Quality:** Assess completeness of resection (R0 resection rate) and specimen fragmentation

#### 2.2.3 Exploratory Objectives
1. Identify surgeon usage patterns (when AI assistance is most valuable)
2. Assess inter-surgeon variability in AI benefit (novice vs. experienced)
3. Evaluate documentation time reduction with AI-generated operative notes

### 2.3 Study Design

#### 2.3.1 Study Type
**Prospective observational, single-arm study with historical controls**

**Rationale for Single-Arm Design:**
- Randomized controlled trial (RCT) would require N=120+ patients (60 per arm) and 18-24 months enrollment
- Historical controls provide adequate comparison for pilot validation
- Single-arm design allows faster enrollment (12 months) and earlier FDA submission
- Literature supports historical control design for surgical device studies (FDA Guidance 2016)

#### 2.3.2 Study Population
- **Target Enrollment:** 60 patients undergoing robotic ESD
- **Sites:** 2 PARADIGM institutions (30 patients each)
- **Historical Controls:** 60 patients (retrospective chart review, 2023-2024)

#### 2.3.3 Study Timeline
- **Month 0:** IRB submission
- **Month 3:** IRB approval (90-day review typical)
- **Months 3-4:** System installation and surgeon training
- **Months 4-15:** Patient enrollment (2-3 cases/week realistic)
- **Months 15-16:** Data analysis and manuscript preparation
- **Month 18:** FDA pre-submission meeting with pilot data

### 2.4 Study Procedures

#### 2.4.1 Screening and Enrollment
1. **Identification:** Surgical scheduler identifies eligible patients at preoperative clinic visit
2. **Consent:** Surgeon or study coordinator obtains written informed consent (see Section 3)
3. **Baseline Data:** Demographics, medical history, lesion characteristics (endoscopy report)

#### 2.4.2 Pre-Operative Phase (24-48 hours before surgery)
1. **AI Pre-Op Planning:** GPT-5 Pro analyzes patient CT/MRI imaging and generates surgical plan
2. **Surgeon Review:** PI reviews AI-generated plan (optional, non-binding)
3. **Standard Care:** No deviation from standard pre-operative protocols

#### 2.4.3 Intra-Operative Phase (Surgical Procedure)
1. **Standard ESD Setup:** Patient positioning, anesthesia, robotic system docking (per standard protocol)

2. **AI System Activation:**
   - Study coordinator activates AI vision overlay (Tier 1)
   - Knowledge assistant enabled for voice queries (Tier 2)
   - Video recording initiated (IRB-approved, de-identified)

3. **Surgeon Use of AI:**
   - **Optional:** Surgeon uses AI assistance at their discretion
   - **Voice Queries:** Surgeon can ask questions verbally (e.g., "Is this the submucosa?")
   - **Overlay Control:** Surgeon can toggle overlay on/off, adjust confidence thresholds
   - **Autonomy:** Surgeon performs all steps per standard technique (AI is advisory only)

4. **Data Collection (Real-Time):**
   - Video timestamps for tissue identification events
   - AI overlay usage (percentage of case with overlay active)
   - Voice query log (questions asked, AI responses)
   - System performance (latency, frame rate, errors)

5. **Standard ESD Completion:**
   - Lesion resection per standard technique
   - Hemostasis, closure (if needed)
   - Specimen retrieval and pathology submission

#### 2.4.4 Post-Operative Phase
1. **Immediate Post-Op (Day 0):**
   - AI auto-generates operative note (surgeon reviews and approves)
   - Standard recovery room care

2. **30-Day Follow-Up:**
   - Clinic visit or phone call (per standard care)
   - Assess for complications (bleeding, perforation, infection, stricture)
   - Pathology report review (R0 resection, margins)

3. **Surgeon Surveys:**
   - System Usability Scale (SUS) - after each case
   - NASA-TLX workload assessment - after each case
   - Satisfaction questionnaire - after case #5, #15, #30

### 2.5 Study Endpoints and Measurements

#### 2.5.1 Primary Endpoint
**Tissue Identification Time (seconds)**

**Definition:** Time from initial tissue exposure to surgeon's verbal or written confirmation of tissue identity ("This is the submucosa" or similar statement).

**Measurement Protocol:**
1. **Video Review:** Two blinded reviewers independently analyze surgical video
2. **Timestamp Recording:** 
   - Start: First clear view of tissue in question (tissue exposed, visible in frame)
   - End: Surgeon confirms tissue identity (verbal statement or proceeds with dissection indicating confident identification)
3. **Multiple Events:** Average of all identification events per case (typically 5-10 events per ESD)
4. **Inter-Rater Reliability:** Cohen's kappa ≥0.70 required; discrepancies resolved by third reviewer

**Historical Control Measurement:**
- Same protocol applied to 60 historical ESD videos (2023-2024)
- Videos selected randomly from EQR surgical database (matching lesion size, location)

**Statistical Analysis:**
- **Primary comparison:** AI group mean vs. historical control mean (two-sample t-test)
- **Hypothesis:** AI group ≤70% of control time (30% reduction)
- **Sample size:** N=52 per group required (effect size d=0.55, alpha=0.05, power=0.80)
- **Planned N:** 60 per group (15% dropout buffer)

#### 2.5.2 Secondary Endpoints

**Safety Endpoints:**

| **Endpoint** | **Definition** | **Time Frame** | **Data Source** |
|--------------|----------------|----------------|-----------------|
| **Intraoperative bleeding** | Estimated blood loss >100mL or need for transfusion | During procedure | Anesthesia record |
| **Perforation** | Full-thickness wall injury requiring repair | During procedure | Operative note |
| **Conversion to open** | Inability to complete robotically | During procedure | Operative note |
| **30-day complications** | Infection, bleeding, stricture, readmission | 30 days | Clinic note, EMR review |
| **Mortality** | Death from any cause | 30 days | EMR, death certificate |

**Non-inferiority margin:** AI group complications ≤ historical control + 5% (absolute difference)

**Efficiency Endpoints:**

| **Endpoint** | **Measurement** | **Data Source** |
|--------------|-----------------|-----------------|
| **Total operative time** | Skin incision to skin closure (minutes) | Anesthesia record |
| **Console time** | Surgeon at console (minutes) | Video timestamp |
| **Estimated blood loss** | Anesthesiologist estimate (mL) | Anesthesia record |
| **Instrument exchanges** | Number of instrument swaps | Video review |

**Usability Endpoints:**

| **Endpoint** | **Instrument** | **Administration** | **Scoring** |
|--------------|----------------|-------------------|-------------|
| **System Usability Scale (SUS)** | 10-item questionnaire | After each case | 0-100 (≥75 = "Good") |
| **NASA-TLX** | 6-dimension workload assessment | After each case | 0-100 per dimension |
| **Satisfaction** | Custom 5-item Likert scale | After cases #5, #15, #30 | 1-5 per item |

**Quality Endpoints:**

| **Endpoint** | **Definition** | **Data Source** |
|--------------|----------------|-----------------|
| **R0 resection** | Complete resection with negative margins | Pathology report |
| **Specimen fragmentation** | Specimen in >3 pieces | Pathology report |
| **Procedure completion** | Successful en bloc resection | Operative note |

### 2.6 Statistical Analysis Plan

#### 2.6.1 Sample Size Calculation (REVISED)
**Primary Endpoint (Tissue Identification Time):**

Assumptions:
- Historical control mean: 15.0 seconds (based on pilot data, N=10)
- Expected AI group mean: 10.5 seconds (30% reduction)
- Standard deviation: 5.0 seconds (both groups, conservative estimate)
- Effect size (Cohen's d): (15.0 - 10.5) / 5.0 = 0.90

Power Analysis (two-sample t-test, two-tailed) (REVISED):
- Alpha = 0.05
- Power = 0.90 ← **REVISED from 0.80 (stronger statistical power)**
- Required sample size: **N=28 per group** ← **REVISED from N=21**

Conservative Adjustment:
- Increase SD to 6.0 seconds (more realistic variability)
- Effect size (Cohen's d): (15.0 - 10.5) / 6.0 = 0.75
- Required sample size: **N=48 per group** ← **REVISED from N=30**

Further Conservative Adjustment (FDA Acceptance):
- Increase SD to 7.0 seconds (account for multi-site variability)
- Effect size (Cohen's d): (15.0 - 10.5) / 7.0 = 0.64
- Required sample size: **N=75 per group**

Dropout Buffer:
- Assume 15% dropout/protocol deviation
- Final planned sample size: **N=86 → N=100 per group** ← **REVISED from N=60**

**FDA Rationale:** N=100 single-arm study provides:
1. Stronger statistical power (90% vs. 80%)
2. Better evidence for 510(k) clearance
3. Lower risk of Type II error (false negative)
4. More robust safety data (100 vs. 60 procedures)

#### 2.6.2 Primary Analysis
**Comparison:** AI group vs. historical controls (tissue identification time)

**Method:** Two-sample t-test (or Wilcoxon rank-sum test if non-normal distribution)

**Hypothesis:**
- Null (H0): μ_AI = μ_control
- Alternative (H1): μ_AI < μ_control (one-sided, 30% reduction)

**Significance Level:** α = 0.05

**Confidence Interval:** 95% CI for difference in means

**Software:** R (version 4.3) or SAS (version 9.4)

#### 2.6.3 Secondary Analyses
**Safety (Non-Inferiority):**
- Compare complication rates (AI vs. control) using Fisher's exact test
- Non-inferiority margin: AI complications ≤ control + 5% (absolute)
- If non-inferior, test for superiority (two-sided test)

**Efficiency:**
- Compare operative time, blood loss (two-sample t-test)
- Adjust for confounders (lesion size, location) using ANCOVA

**Usability:**
- SUS score: Compare to industry benchmark (≥75 = "Good")
- NASA-TLX: Paired t-test (pre vs. post training, if available)

**Quality:**
- R0 resection rate: Compare using Fisher's exact test

#### 2.6.4 Subgroup Analyses (Exploratory)
- **Surgeon Experience:** Novice (<50 robotic cases) vs. Experienced (≥50 cases)
- **Lesion Location:** Gastric vs. Colon
- **Lesion Size:** 2-3 cm vs. 3-5 cm
- **AI Usage Intensity:** Low (<50% overlay active) vs. High (≥50%)

#### 2.6.5 Interim Analysis
**Data Safety Monitoring Board (DSMB) Reviews:**
- After 20 patients: Safety review (complications)
- After 40 patients: Futility analysis (if benefit unlikely, stop early)

**Stopping Rules:**
- **Safety:** If AI group complication rate >15% higher than control, pause enrollment for DSMB review
- **Futility:** If conditional power <20% at N=40, consider early termination

### 2.7 Data Management

#### 2.7.1 Data Collection
- **Electronic Case Report Forms (eCRFs):** REDCap (HIPAA-compliant, hosted at PI institution)
- **Video Data:** De-identified surgical videos stored on encrypted EQR server (AES-256)
- **Device Performance Logs:** Automated system logs (latency, frame rate, errors)

#### 2.7.2 Data Quality
- **Source Document Verification:** 100% of eCRFs verified against source (operative notes, pathology reports)
- **Video Review:** Dual independent review with inter-rater reliability check (κ ≥0.70)
- **Missing Data:** <5% missing data acceptable; multiple imputation if >5%

#### 2.7.3 Data Security
- **PHI Handling:** All patient data de-identified (unique study ID assigned)
- **Access Control:** Role-based access (PI, coordinators, data manager only)
- **Backup:** Daily automated backups to secure cloud storage (AWS GovCloud, HIPAA BAA)

### 2.8 Regulatory Compliance

#### 2.8.1 IRB Oversight
- **Initial Review:** Full board review (not expedited due to device investigation)
- **Continuing Review:** Annual renewal required
- **Amendments:** Any protocol changes require IRB approval before implementation
- **Adverse Event Reporting:** Serious adverse events (SAEs) reported within 24 hours

#### 2.8.2 FDA Regulations
- **Device Classification:** Non-Significant Risk (NSR) per 21 CFR 812.3(m)
- **IDE Requirements:** Abbreviated IDE (sponsor-investigator agreement, no FDA submission required for NSR)
- **MAUDE Reporting:** Device-related adverse events reported within 30 days (21 CFR 803)

#### 2.8.3 HIPAA Compliance
- **Authorization:** Patients sign HIPAA authorization for research use of medical records
- **De-Identification:** All data de-identified per HIPAA Safe Harbor method (18 identifiers removed)
- **Data Use Agreement:** EQR and PI institution sign data use agreement (DUA)

---

## 3. Informed Consent Form

### CONSENT TO PARTICIPATE IN A RESEARCH STUDY

**Study Title:** Prospective Observational Study of AI-Integrated Visualization and Knowledge Assistance During Robotic Endoscopic Submucosal Dissection

**Protocol Number:** EQR-AI-ESD-2025-001

**Principal Investigator:**  
[Name], MD, FACS  
Department of Surgery  
[PARADIGM Institution]  
[Phone]

**Sponsor:**  
EQR Surgical Robotics, Inc.

---

### INTRODUCTION

You are being asked to participate in a research study. This form provides information about the study to help you decide whether to participate. Please read this form carefully and ask any questions you may have before agreeing to participate.

**Why is this study being done?**

This study is testing a new artificial intelligence (AI) system that helps surgeons during robotic surgery. The AI system provides:
1. **Visual overlays** that highlight important tissues (like blood vessels) during surgery
2. **Voice-activated assistance** where surgeons can ask questions and get information
3. **Automated documentation** that reduces paperwork time after surgery

The goal is to see if this AI system makes surgery safer and more efficient without adding risks to patients.

**How many people will participate?**

About 100 patients at 2 hospitals will participate in this study over 18 months. ← **REVISED from 60 patients**

---

### WHAT WILL HAPPEN IF I PARTICIPATE?

**Before Your Surgery:**
- You will have the same tests and clinic visits as any patient having this surgery
- The AI system will analyze your CT or MRI scans and create a surgical plan (your surgeon will review this but is not required to use it)

**During Your Surgery:**
- Your surgery will be performed exactly as planned using the EQR robotic system
- The AI system will be active during your surgery, providing visual overlays and voice assistance to your surgeon
- **IMPORTANT:** Your surgeon is always in control. The AI system only provides suggestions—your surgeon makes all decisions and controls the robot at all times
- Your surgery will be video recorded (with your face and identifiable information removed) so researchers can analyze the AI system's performance

**After Your Surgery:**
- You will recover normally in the hospital (same as patients without the AI system)
- You will have a follow-up clinic visit or phone call 30 days after surgery (this is standard care for your surgery type)
- The AI system will help your surgeon write the operative note faster, but your surgeon will review and approve it

**How long will I be in the study?**

Your participation will last from the day of your surgery through your 30-day follow-up visit (about 1 month total).

---

### WHAT ARE THE RISKS?

**Surgical Risks (Same as Standard Surgery):**

Your surgery has the same risks whether or not you participate in this study. These risks include:
- Bleeding (5-10% of cases)
- Perforation (hole in the intestine wall, 2-5% of cases)
- Infection (1-2% of cases)
- Need for additional surgery if complications occur (1-3% of cases)

**AI System Risks (Minimal Additional Risk):**

The AI system is designed to have minimal additional risk because:
- **Your surgeon is always in control** (the AI only provides suggestions, it does not control the robot)
- **Hardware safety system** stops the robot immediately if forces are too high (this works independently of the AI)
- **If the AI system fails**, your surgery continues normally without it

Possible AI-specific risks:
- **Distraction:** The visual overlays might briefly distract your surgeon (similar to a GPS in a car). Your surgeon can turn off the overlays at any time.
- **Incorrect Information:** The AI might misidentify tissues (e.g., labeling a blood vessel incorrectly). Your surgeon is trained to recognize this and always makes the final decision based on their expert judgment, not the AI's suggestion.
- **Technical Failure:** The AI system might stop working during surgery (rare, <1% expected). If this happens, your surgery continues normally without AI assistance.

**Privacy Risks:**

- Your surgery will be video recorded, but your face and all identifiable information will be removed
- Video data will be stored securely with encryption
- Only the research team will have access to your de-identified information
- There is a small risk of data breach, but this is minimized through strong security measures

---

### WHAT ARE THE BENEFITS?

**Potential Benefits to You:**

You may or may not receive direct benefit from participating in this study. Possible benefits include:
- **Faster tissue identification:** The AI overlays may help your surgeon identify important tissues more quickly, potentially making surgery safer
- **Reduced operative time:** If the AI helps your surgeon work more efficiently, your surgery might be shorter (though this is not guaranteed)

**You should not expect to receive direct benefit** from participating. Your surgery will be performed to the same high standard with or without the AI system.

**Benefits to Others:**

This study may help future patients by:
- Improving the safety and efficiency of robotic surgery
- Training new surgeons faster with AI assistance
- Reducing surgeon workload and burnout through automated documentation

---

### WHAT OTHER OPTIONS DO I HAVE?

You do not have to participate in this study to have your surgery. If you choose not to participate:
- You will have the exact same surgery without the AI system
- Your surgeon will perform your surgery using the standard EQR robotic system (which is FDA-cleared and widely used)
- Your medical care will not be affected in any way

---

### WHAT ABOUT CONFIDENTIALITY?

**How will my information be protected?**

We will take the following steps to protect your privacy:
- All study data will be assigned a unique ID number (your name will not be used)
- Video recordings will have your face blurred and any identifiable information removed
- Data will be stored on secure, encrypted servers (only the research team can access it)
- Your name will never appear in any publications or presentations

**Who will have access to my information?**

- The research team (surgeon, coordinators, data analysts)
- The Institutional Review Board (IRB) that oversees this study
- The study sponsor (EQR Surgical Robotics, Inc.)
- The Food and Drug Administration (FDA), if they audit the study
- Your insurance company will **not** have access to study data

**Can I be identified in research publications?**

No. Any publications or presentations about this study will not include your name or any information that could identify you.

---

### WHAT ARE THE COSTS?

**Will I have to pay for anything?**

No. You will not be charged for:
- The AI system
- Any study-related procedures
- Video recording or data analysis

**What about my regular surgery costs?**

Your health insurance will cover the costs of your surgery, just as if you were not in the study. You (or your insurance) will be billed for:
- The surgery itself (standard robotic ESD fees)
- Hospital stay
- Follow-up visits

These costs are the same whether or not you participate in the study.

---

### WILL I BE PAID?

You will not be paid for participating in this study.

---

### WHAT IF I AM INJURED?

If you are injured as a result of participating in this study, medical treatment will be available. However, you or your insurance will be responsible for the cost of that treatment.

**If you believe you have been injured as a result of this study, contact the Principal Investigator immediately:**

[PI Name]  
[Phone]  
[Email]

---

### CAN I STOP PARTICIPATING?

**Yes, you can stop at any time.**

Your participation is completely voluntary. You can decide not to participate or to stop participating at any time without penalty or loss of benefits to which you are otherwise entitled.

If you decide to stop participating:
- Your future medical care will not be affected
- Your surgeon will continue your surgery without the AI system (if you withdraw during the procedure)
- Data collected before your withdrawal may still be used (we cannot "un-record" video data, but we will not collect new data)

**Can the researcher stop my participation?**

Yes. The researcher may withdraw you from the study if:
- Your safety is at risk
- You do not follow study procedures
- The study is stopped or canceled

---

### WHO CAN I CONTACT WITH QUESTIONS?

**If you have questions about the study:**

Principal Investigator: [Name], MD  
Phone: [Number]  
Email: [Email]

**If you have questions about your rights as a research participant:**

Institutional Review Board (IRB)  
[Institution Name]  
Phone: [Number]  
Email: [Email]

---

### CONSENT SIGNATURE

**I have read this consent form (or it has been read to me). I have had the opportunity to ask questions, and all my questions have been answered to my satisfaction. I voluntarily agree to participate in this study.**

**I understand that:**
- My participation is voluntary
- I can stop participating at any time
- My medical care will not be affected if I choose not to participate or to withdraw

**I will receive a signed copy of this consent form.**

---

**Participant Signature:** ____________________  **Date:** ______

**Participant Name (printed):** ____________________

---

**Person Obtaining Consent:** ____________________  **Date:** ______

**Name (printed):** ____________________

**Relationship to Study:** [ ] Principal Investigator  [ ] Study Coordinator

---

### HIPAA AUTHORIZATION

**I authorize the use and disclosure of my health information as described in this consent form for the purposes of this research study.**

I understand that:
- My health information will be de-identified (no names or identifiable information)
- The research team, sponsor, IRB, and FDA may access my medical records for this study
- I can revoke this authorization at any time by contacting the Principal Investigator

This authorization does not expire unless I revoke it.

**Participant Signature:** ____________________  **Date:** ______

---

## 4. Investigator Brochure

### 4.1 Device Description

**Device Name:** EQR AI-Integrated Surgical System  
**Manufacturer:** EQR Surgical Robotics, Inc.  
**Indications for Use:** Visualization and knowledge assistance during robotic endoscopic submucosal dissection (ESD) procedures  
**Device Classification:** Non-Significant Risk (NSR) investigational device

### 4.2 System Architecture

The EQR AI-Integrated Surgical System consists of four tiers:

**Tier 0: Hardware Safety Layer (FPGA-Based)**
- Independent emergency stop system (<2ms latency)
- Dual Modular Redundancy for fail-safe operation
- Force/torque sensor monitoring (ATI Nano17, 7kHz sampling)
- **Key Feature:** Operates independently of all AI/software systems

**Tier 1: Real-Time Vision AI**
- YOLOv8-Medium + SAM (Segment Anything Model)
- NVIDIA Jetson AGX Orin (275 TOPS)
- Color-coded tissue overlays (vessels, muscle, lesion)
- Latency: 35ms (advisory, non-critical)

**Tier 2: Edge AI Knowledge Assistant**
- GPT-4o-mini (on-device, medical knowledge base)
- Voice-activated queries (Whisper v3 speech-to-text)
- Response time: 1-2 seconds
- Privacy: All processing on-device (no cloud during surgery)

**Tier 3: Cloud AI Documentation**
- GPT-5 Pro (pre-operative planning)
- Codex (automated operative notes)
- Video API (post-operative analysis)
- Timeline: Before/after surgery only (not real-time critical)

### 4.3 Preclinical Testing Summary

**Benchtop Testing:**
- FPGA safety layer: 1,000 E-stop cycles, 100% success, <2ms latency
- Vision AI accuracy: 87% mAP on surgical video dataset (N=500 videos)
- Knowledge assistant relevance: 90% relevant responses (surgeon validation, N=50 queries)

**Simulated Surgery:**
- VR surgical simulator testing (N=10 surgeons, 100 cases)
- No adverse events attributed to AI distraction
- System Usability Scale: 78/100 (Good)

**Electrical Safety:**
- IEC 60601-1 compliant (medical electrical equipment)
- EMC testing (IEC 60601-1-2): Emissions and immunity passed

**Cybersecurity:**
- Penetration testing by Coalfire: No critical vulnerabilities
- Software Bill of Materials (SBOM): All components CVE-tracked

### 4.4 Clinical Experience

**Prior Human Use:** None (this is the first-in-human study)

**Similar Devices:**
- da Vinci Surgical System with Firefly fluorescence imaging (FDA-cleared, widely used)
- Hugo RAS System with 3D HD vision (FDA-cleared 2024)
- AI-assisted surgical navigation (Medtronic StealthStation, FDA-cleared)

**Key Difference:** This system integrates multiple AI modalities (vision, language, documentation) in a single platform with PCCP-enabled continuous improvement.

### 4.5 Known Risks and Mitigation

| **Risk** | **Probability** | **Severity** | **Mitigation** |
|----------|----------------|--------------|----------------|
| **AI misidentification** | Medium | Moderate | Confidence indicators, surgeon override always available |
| **System latency** | Low | Moderate | Real-time monitoring, fallback to no overlay if >50ms |
| **Distraction** | Medium | Low | Training emphasizes surgeon as primary decision-maker |
| **Technical failure** | Low | Low | Surgery continues without AI assistance |
| **Data breach** | Very Low | Moderate | Encryption, secure storage, de-identification |

### 4.6 Investigator Responsibilities

1. **Training:** Complete 10-hour training program before enrolling patients
2. **Consent:** Obtain written informed consent from all participants
3. **Device Use:** Use AI system per protocol (optional, at surgeon discretion)
4. **Adverse Event Reporting:** Report device-related AEs within 24 hours to sponsor and IRB
5. **Data Collection:** Complete all eCRFs accurately and promptly
6. **Compliance:** Follow protocol, IRB approvals, FDA regulations (21 CFR 812)

---

## 5. Data Safety Monitoring Plan

### 5.1 Data Safety Monitoring Board (DSMB)

**Composition:**
- 3 independent experts (surgeon, biostatistician, patient advocate)
- No financial interest in EQR or the AI system

**Responsibilities:**
- Review safety data at 20-patient intervals
- Recommend study continuation, modification, or termination
- Ensure patient safety is prioritized

**Meeting Schedule:**
- After 20 patients enrolled
- After 40 patients enrolled
- Unscheduled meetings if serious adverse events occur

### 5.2 Adverse Event Definitions

**Adverse Event (AE):** Any untoward medical occurrence in a patient, whether or not related to the device

**Serious Adverse Event (SAE):** An AE that results in:
- Death
- Life-threatening condition
- Inpatient hospitalization or prolongation
- Persistent or significant disability
- Congenital anomaly/birth defect

**Device-Related AE:** AE caused or contributed to by the AI system (determined by PI)

### 5.3 Reporting Procedures

**Immediate Reporting (Within 24 Hours):**
- All Serious Adverse Events (SAEs)
- Device malfunctions that could cause SAE

**Report To:**
- Principal Investigator
- Institutional Review Board (IRB)
- Sponsor (EQR Surgical Robotics)

**Periodic Reporting:**
- Non-serious AEs: Reported in annual IRB renewal

### 5.4 Stopping Rules

**Pause Enrollment If:**
- SAE rate >10% in AI group (vs. <5% expected historical rate)
- Device-related SAE occurs (any)
- DSMB recommends pause for safety review

**Terminate Study If:**
- DSMB determines risks outweigh benefits
- FDA issues clinical hold
- IRB withdraws approval

---

## 6. Case Report Forms (CRFs)

### 6.1 Baseline CRF

**Study ID:** _______  
**Enrollment Date:** _______  
**Site:** [ ] Site 1  [ ] Site 2

**Demographics:**
- Age: _____ years
- Sex: [ ] Male  [ ] Female  [ ] Other
- BMI: _____ kg/m²

**Medical History:**
- ASA Class: [ ] I  [ ] II  [ ] III
- Prior abdominal surgery: [ ] Yes  [ ] No
- Anticoagulation: [ ] Yes  [ ] No

**Lesion Characteristics:**
- Location: [ ] Gastric  [ ] Colon (specify: _______)
- Size: _____ cm (largest diameter)
- Morphology: [ ] Flat  [ ] Elevated  [ ] Depressed
- Pathology (biopsy): _____________________

### 6.2 Intraoperative CRF

**Study ID:** _______  
**Surgery Date:** _______  
**Surgeon:** _______

**AI System Performance:**
- Vision overlay active: [ ] Yes  [ ] No  
  - If yes, % of case: _____ %
- Voice queries used: [ ] Yes  [ ] No  
  - If yes, number of queries: _____
- System malfunctions: [ ] Yes  [ ] No  
  - If yes, describe: _____________________

**Surgical Data:**
- Operative time (skin-to-skin): _____ minutes
- Console time (surgeon at robot): _____ minutes
- Estimated blood loss: _____ mL
- Instrument exchanges: _____
- Conversion to open: [ ] Yes  [ ] No

**Complications:**
- Intraoperative bleeding: [ ] Yes  [ ] No
- Perforation: [ ] Yes  [ ] No
- Other (specify): _____________________

### 6.3 Post-Operative CRF (30-Day)

**Study ID:** _______  
**Follow-Up Date:** _______

**Clinical Status:**
- Readmission: [ ] Yes  [ ] No
- Complications:
  - Infection: [ ] Yes  [ ] No
  - Bleeding: [ ] Yes  [ ] No
  - Stricture: [ ] Yes  [ ] No
  - Other: _____________________

**Pathology Results:**
- R0 resection: [ ] Yes  [ ] No
- Specimen fragmentation: [ ] Yes  [ ] No
- Final diagnosis: _____________________

**Adverse Events:**
- Any AEs since surgery: [ ] Yes  [ ] No
- If yes, describe: _____________________

---

## 7. Regulatory Documents

### 7.1 FDA Determination (NSR Device)

**Rationale for Non-Significant Risk (NSR) Classification:**

Per 21 CFR 812.3(m), the EQR AI-Integrated Surgical System is classified as NSR because:

1. **Not implanted:** Device is external (attached to robotic system console)
2. **Not used for life support:** Surgery proceeds safely without AI assistance
3. **Limited risk:** AI is advisory only, surgeon retains full control
4. **No increased risk of harm:** Adverse event rate expected equal to or lower than standard surgery

**Regulatory Pathway:**
- Abbreviated IDE (no FDA submission required for NSR)
- IRB approval required before enrollment
- FDA 510(k) submission planned post-pilot (with PCCP)

### 7.2 Conflict of Interest Disclosure

**Principal Investigator:**
- No financial interest in EQR Surgical Robotics, Inc.
- Research funding provided by EQR (disclosed to IRB)

**Study Coordinators:**
- No financial conflicts of interest

**Surgeon Advisors:**
- May receive consulting fees from EQR (disclosed to IRB, not contingent on study results)

### 7.3 Protocol Amendments

**Amendment History:**

| **Version** | **Date** | **Changes** | **IRB Approval** |
|-------------|----------|-------------|------------------|
| 1.0 | 2025-Q2 | Initial protocol | Pending |

**Amendment Procedures:**
- All protocol changes require IRB approval before implementation
- Major amendments (eligibility criteria, endpoints) require full board review
- Minor amendments (administrative) may be approved by expedited review

---

## Document Approval

**Principal Investigator:**

Signature: ____________________  Date: ______

[Name], MD, FACS

**Sponsor Representative:**

Signature: ____________________  Date: ______

[Name], VP of Clinical Affairs, EQR Surgical Robotics, Inc.

**IRB Approval Stamp:**

[Institutional IRB Stamp Here Upon Approval]

---

**Document Version:** 1.0  
**Submission Date:** 2025-Q2  
**Confidentiality:** IRB Submission - Regulatory Use Only
