# EQR AI Integration - MVP 서비스 전략
## 각 팀에게 제공할 단계별 MVP 서비스 정의

---

## 🎯 MVP 철학: "Minimum Viable Product" vs "Minimum Lovable Product"

### 현재 문서의 문제점
현재 기술 사양서는 **완전한 4-Tier 시스템**을 목표로 하고 있습니다:
- Tier 0: FPGA 하드웨어 안전 레이어
- Tier 1: 실시간 Vision AI (YOLOv8 + SAM)
- Tier 2: Edge AI 지식 어시스턴트 (GPT-4o-mini)
- Tier 3: Cloud AI (GPT-5 Pro 사전/사후 분석)

**문제:** 12주 만에 4개 Tier 모두 구현은 **비현실적**입니다.

### MVP 재정의: 3단계 접근법

```
Phase 0 (Week 1-4): 기술 검증 (Proof of Concept)
└── 목표: "AI가 수술 비디오에서 조직을 인식할 수 있는가?"
    └── 제공: 외과의사 팀에게 데모 가능한 프로토타입

Phase 1 (Week 5-12): 핵심 가치 MVP (Minimum Lovable Product)
└── 목표: "외과의사가 실제 수술에서 사용하고 싶어하는가?"
    └── 제공: Pilot Site에 배포 가능한 시스템

Phase 2 (Week 13-24): 임상 검증 MVP (Clinical Validation)
└── 목표: "IRB 승인 하에 60명 환자 데이터 수집 가능한가?"
    └── 제공: FDA 제출용 임상 데이터
```

---

## 📊 각 팀별 MVP 서비스 정의

### 1️⃣ **외과의사 팀 (Surgeon Team)**

#### 🎯 핵심 니즈
> "수술 중 조직 구분이 어려울 때, AI가 실시간으로 도움을 줄 수 있는가?"

#### Phase 0: 기술 검증 (Week 1-4)

**제공 서비스: "AI Tissue Recognition Demo"**

**기능:**
- 기존 수술 비디오 (PARADIGM 데이터베이스)를 AI가 분석
- 조직 타입 자동 태깅: 혈관(빨강), 근육층(파랑), 병변(초록)
- Confidence score 표시: High (>85%), Medium (70-85%), Low (<70%)

**인터페이스:**
- 웹 기반 데모 (별도 하드웨어 불필요)
- 외과의사가 수술 비디오 업로드 → AI 분석 결과 오버레이
- 재생 속도 조절, 프레임별 이동 가능

**기술 스택:**
```python
# Backend: Flask + YOLOv8 inference
from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2

app = Flask(__name__)
model = YOLO('yolov8m_surgical_tissues.pt')  # Pre-trained on surgical dataset

@app.route('/analyze_video', methods=['POST'])
def analyze_video():
    video_file = request.files['video']
    # Process video, return frame-by-frame detections
    results = model(video_file)
    return jsonify({
        'detections': results,
        'confidence_scores': [det.conf for det in results]
    })
```

**외과의사 피드백 수집:**
- "AI가 맞게 인식한 비율은?"
- "어떤 조직 타입에서 가장 유용한가?"
- "Confidence score가 낮을 때, 실제로 애매한 경우인가?"

**성공 기준:**
- [ ] 10명 외과의사가 데모 체험
- [ ] 평균 정확도 평가: "AI가 70% 이상 정확하다고 느낌"
- [ ] 관심도: "실제 수술에서 사용해보고 싶다" 80% 이상

---

#### Phase 1: 핵심 가치 MVP (Week 5-12)

**제공 서비스: "Real-Time AI Surgical Overlay"**

**기능:**
- **실시간 조직 인식:** 수술 중 내시경 카메라에서 실시간 오버레이 (35ms latency)
- **On/Off 토글:** 외과의사가 오버레이 켜기/끄기 (발 페달 또는 음성 명령)
- **Confidence 조절:** 임계값 조정 (예: 80% 이상만 표시)
- **수술 비디오 자동 녹화:** 사후 검토용 (de-identified)

**하드웨어 구성:**
```
OR (Operating Room) Setup:
┌────────────────────────────────────────┐
│ Existing EQR Robotic System            │
│   └── Endoscope Camera (1080p, 60fps) │
└─────────────┬──────────────────────────┘
              │ HDMI Output
              ↓
┌────────────────────────────────────────┐
│ AI Processing Unit (Jetson AGX Orin)   │
│ • YOLOv8-Medium (TensorRT FP16)        │
│ • Latency: 35ms                        │
│ • Overlay Rendering (OpenGL)           │
└─────────────┬──────────────────────────┘
              │ HDMI Output
              ↓
┌────────────────────────────────────────┐
│ Surgeon Display (Monitor)               │
│ • Shows Original + AI Overlay          │
│ • Color-coded tissues                  │
└────────────────────────────────────────┘
```

**인터페이스:**
- **Primary Display:** 기존 수술 모니터에 오버레이 추가 (workflow 방해 최소화)
- **Control Tablet:** iPad/Android 태블릿 (수술실 간호사가 조작)
  - AI On/Off 버튼
  - Confidence threshold 슬라이더 (50% - 95%)
  - 녹화 시작/중지

**외과의사 트레이닝:**
- **1시간 강의:** AI 시스템 작동 원리, 한계점 설명
- **2시간 시뮬레이터:** 가상 수술 환경에서 AI 오버레이 체험
- **2-3 Cases 관찰:** 숙련된 외과의사의 실제 수술 관찰 (AI 사용)
- **첫 케이스 슈퍼비전:** AI 개발팀이 OR에 대기, 문제 즉시 해결

**수집 데이터:**
- AI 사용 시간 (% of case): 전체 수술 중 오버레이 활성화 비율
- Override 빈도: 외과의사가 AI 제안을 무시한 횟수
- 주관적 만족도: 수술 직후 5분 설문 (NASA-TLX, SUS)
- 객관적 효율성: 조직 인식 시간 (비디오 분석)

**성공 기준:**
- [ ] 5 Cases 완료 (2명 외과의사, 각 2-3 cases)
- [ ] AI 사용률: 평균 60% 이상 (외과의사가 자발적으로 사용)
- [ ] 시스템 안정성: 중대한 기술적 실패 0건
- [ ] 외과의사 피드백: "다음 케이스에도 사용하고 싶다" 100%

---

#### Phase 2: 임상 검증 MVP (Week 13-24)

**제공 서비스: "FDA-Ready Clinical Study Platform"**

**추가 기능:**
- **자동 데이터 수집:** Primary endpoint (tissue ID time) 자동 측정
- **Adverse Event 추적:** 수술 중 합병증 실시간 기록
- **HIPAA-compliant 저장:** 모든 데이터 암호화, REDCap 연동
- **DSMB 대시보드:** Data Safety Monitoring Board가 실시간 안전성 모니터링

**외과의사 제공 가치:**
- **문서 부담 감소:** AI가 operative note 초안 자동 생성 (외과의사는 검토만)
- **성과 추적:** 자신의 수술 효율성 지표 (operative time, 합병증률) 대시보드
- **학술 기여:** 연구 공동저자 자격 (논문, 학회 발표)

**성공 기준:**
- [ ] N=60 환자 등록 완료 (12개월)
- [ ] Primary endpoint 달성: 조직 인식 시간 30% 단축
- [ ] Safety: 합병증률 non-inferior (역사적 대조군 대비 ≤5% 차이)
- [ ] 외과의사 만족도: SUS ≥75/100 (업계 "Good" 기준)

---

### 2️⃣ **개발팀 (Engineering Team)**

#### 🎯 핵심 니즈
> "12주 안에 실제 수술실에 배포 가능한 시스템을 만들 수 있는가?"

#### Phase 0: 기술 검증 (Week 1-4)

**제공 서비스: "AI Model Training Pipeline"**

**Milestone 1: 데이터 수집 및 전처리**
```python
# data_pipeline.py
import cv2
import pandas as pd
from pathlib import Path

class SurgicalVideoDataset:
    """
    PARADIGM 데이터베이스에서 수술 비디오 수집
    """
    def __init__(self, paradigm_db_path):
        self.db_path = Path(paradigm_db_path)
        self.videos = self._discover_videos()
        
    def _discover_videos(self):
        """
        ESD 수술 비디오 검색 (2023-2024)
        필터: Lesion size 2-5cm, 결장/위
        """
        videos = []
        for video_path in self.db_path.glob('**/*.mp4'):
            metadata = self._read_metadata(video_path)
            if self._is_valid_case(metadata):
                videos.append({
                    'path': video_path,
                    'lesion_size': metadata['lesion_size_cm'],
                    'location': metadata['location'],
                    'surgeon': metadata['surgeon_id']
                })
        return pd.DataFrame(videos)
    
    def extract_frames(self, fps=1):
        """
        비디오에서 프레임 추출 (1 FPS = 60초 수술에서 60 프레임)
        """
        frames = []
        for _, row in self.videos.iterrows():
            cap = cv2.VideoCapture(str(row['path']))
            frame_count = 0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                if frame_count % (30 * fps) == 0:  # 30 FPS 가정
                    frames.append({
                        'image': frame,
                        'video_id': row['path'].stem,
                        'timestamp': frame_count / 30.0
                    })
                frame_count += 1
            cap.release()
        return frames
```

**Milestone 2: 데이터 라벨링 (Annotation)**

**Option A: 외과의사 수동 라벨링**
- Tool: CVAT (Computer Vision Annotation Tool) 또는 LabelImg
- 작업량: 1,000 비디오 × 50 프레임 = 50,000 프레임
- 시간: 외과의사 1명이 1 프레임당 30초 = 417 시간
- **문제:** 비현실적 → 샘플링 필요

**Option B: Semi-Automated 라벨링 (추천)**
```python
# semi_automated_labeling.py
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator

# 1. SAM (Segment Anything Model)으로 자동 세그멘테이션
sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h.pth")
mask_generator = SamAutomaticMaskGenerator(sam)

# 2. 외과의사는 마스크에 라벨만 할당 (혈관, 근육, 병변 등)
def surgeon_labeling_interface(frame, masks):
    """
    외과의사가 보는 인터페이스:
    - 화면: 프레임 + SAM이 자동 생성한 마스크 오버레이
    - 작업: 각 마스크 클릭 → 드롭다운에서 조직 타입 선택
    - 시간: 1 프레임당 30초 → 10초로 단축 (3배 빠름)
    """
    pass
```

**Target Dataset:**
- 초기 학습: 5,000 프레임 (10 비디오 × 500 프레임)
- 외과의사 라벨링 시간: 5,000 × 10초 / 3600 = 14 시간 (2 외과의사 × 7시간)
- Classes: 5가지 (혈관, 근육층, 점막하층, 병변, 배경)

**Milestone 3: YOLOv8 Training**
```bash
# Train YOLOv8-Medium on surgical dataset
yolo train data=surgical_tissues.yaml model=yolov8m.pt epochs=100 imgsz=640 batch=16

# Validation
yolo val model=runs/train/exp/weights/best.pt data=surgical_tissues.yaml

# Expected Performance:
# - mAP@0.5: 85-90% (good for medical imaging)
# - mAP@0.5:0.95: 70-75%
# - Inference speed: 15-18ms on Jetson AGX Orin (TensorRT FP16)
```

**개발팀 성공 기준:**
- [ ] 5,000 프레임 라벨링 완료 (Week 2)
- [ ] YOLOv8 학습 완료, mAP ≥85% (Week 3)
- [ ] TensorRT 변환, Jetson에서 <20ms 추론 (Week 4)
- [ ] 데모 웹앱 배포 (Flask + React, Week 4)

---

#### Phase 1: 핵심 가치 MVP (Week 5-12)

**제공 서비스: "Real-Time Inference System"**

**Sprint 1 (Week 5-6): Hardware Integration**

**하드웨어 목록 (간소화):**
| Component | Spec | Cost | Lead Time |
|-----------|------|------|-----------|
| Jetson AGX Orin Dev Kit | 64GB, 275 TOPS | $2,000 | 4 weeks |
| Basler Camera | 4MP, 60 FPS (if EQR camera incompatible) | $1,200 | 2 weeks |
| HDMI Capture Card | 4K@60fps (if needed) | $300 | Stock |
| Enclosure | Fanless, IP54 | $200 | Stock |
| **TOTAL (1 unit)** | | **$3,700** | |

**참고:** FPGA 안전 레이어는 **Phase 2로 연기** (MVP에서 불필요)
- 이유: AI는 advisory only, 로봇 제어 안 함
- Phase 1 목표: AI 정확도 및 외과의사 수용성 검증

**작업 리스트:**
```bash
# Week 5: Jetson Setup
1. Flash JetPack 6.0 (Ubuntu 22.04 + CUDA 12.2)
2. Install TensorRT, OpenCV, ROS2
3. Test camera capture (V4L2 driver)
4. Benchmark inference (YOLOv8 + TensorRT)

# Week 6: Real-Time Pipeline
1. Implement inference loop (C++)
   - Camera capture → Preprocess → YOLOv8 inference → SAM segmentation → Overlay render
2. Optimize latency (target: <35ms end-to-end)
   - Use CUDA streams for parallel processing
   - Reduce SAM overhead (only segment high-confidence detections)
3. Integration testing (1,000 frames, measure FPS and latency)
```

**Sprint 2 (Week 7-8): User Interface**

**Control Interface (iPad App):**
```swift
// SwiftUI for iPad Control App
import SwiftUI

struct SurgicalAIControlView: View {
    @State private var aiEnabled = false
    @State private var confidenceThreshold = 0.80
    @State private var recording = false
    
    var body: some View {
        VStack(spacing: 30) {
            // AI On/Off Toggle
            Toggle("AI Overlay", isOn: $aiEnabled)
                .font(.title)
                .onChange(of: aiEnabled) { value in
                    sendCommand("ai_enabled", value)
                }
            
            // Confidence Threshold Slider
            VStack {
                Text("Confidence Threshold: \(Int(confidenceThreshold * 100))%")
                Slider(value: $confidenceThreshold, in: 0.5...0.95)
                    .onChange(of: confidenceThreshold) { value in
                        sendCommand("confidence_threshold", value)
                    }
            }
            
            // Recording Control
            Button(action: { 
                recording.toggle()
                sendCommand("recording", recording)
            }) {
                Label(recording ? "Stop Recording" : "Start Recording", 
                      systemImage: recording ? "stop.circle" : "record.circle")
                    .font(.title2)
            }
            
            // System Status
            HStack {
                StatusIndicator(label: "AI Status", status: aiEnabled ? .active : .inactive)
                StatusIndicator(label: "Latency", status: .active, value: "32ms")
                StatusIndicator(label: "FPS", status: .active, value: "28")
            }
        }
        .padding()
    }
    
    func sendCommand(_ key: String, _ value: Any) {
        // Send command to Jetson via WebSocket
        WebSocketManager.shared.send(["command": key, "value": value])
    }
}
```

**Sprint 3 (Week 9-10): OR Integration Testing**

**테스트 환경: Mock OR (실제 수술실 시뮬레이션)**
- 기존 EQR 로봇 시스템 연결
- Phantom tissue 사용 (실제 조직 대신 훈련용 모형)
- 5명 외과의사 × 2시간 테스트 세션

**테스트 시나리오:**
1. **Scenario A: Normal Operation**
   - AI 오버레이가 조직을 정확히 인식
   - 외과의사가 overlay를 참고하여 절제선 결정
   
2. **Scenario B: AI Misidentification**
   - AI가 잘못 인식 (예: 혈관을 근육으로 오인)
   - 외과의사가 AI 무시하고 올바른 판단
   - 시스템 로그: "AI override event"
   
3. **Scenario C: Low Confidence**
   - AI confidence <70% (애매한 조직)
   - 시스템이 "Low Confidence" 경고 표시
   - 외과의사가 추가 확인 (줌인, 다른 각도)

**Sprint 4 (Week 11-12): Bug Fix & Polish**

**수집된 피드백 반영:**
```
Common Feedback from Mock OR Testing:
1. "오버레이 색상이 너무 밝아서 원본 이미지가 안 보임"
   → Fix: Opacity 조절 기능 추가 (50%-90%)

2. "Confidence threshold를 수술 중에 바꾸기 어려움"
   → Fix: Preset 버튼 추가 (Conservative 85%, Balanced 75%, Aggressive 65%)

3. "가끔 프레임이 끊김"
   → Fix: GPU 메모리 leak 수정, buffer size 증가

4. "수술 비디오 녹화가 자동으로 시작되면 좋겠음"
   → Fix: "Auto-record on AI enable" 옵션 추가
```

**개발팀 성공 기준:**
- [ ] Real-time inference <35ms (Week 8)
- [ ] iPad control app functional (Week 8)
- [ ] Mock OR testing 5 sessions (Week 10)
- [ ] All P0 bugs fixed (Week 12)
- [ ] System ready for first real case (Week 13)

---

#### Phase 2: 임상 검증 MVP (Week 13-24)

**제공 서비스: "Clinical Data Collection Platform"**

**추가 기능:**
1. **자동 데이터 수집:**
   ```python
   # auto_data_collection.py
   class ClinicalDataCollector:
       def __init__(self):
           self.session = {
               'patient_id': None,  # De-identified ID
               'surgeon': None,
               'start_time': None,
               'end_time': None,
               'ai_usage_percent': 0.0,
               'tissue_id_events': [],
               'ai_override_events': [],
               'complications': []
           }
       
       def log_tissue_identification(self, timestamp, tissue_type, ai_confidence):
           """
           Primary endpoint 측정:
           - 조직 노출 시간 (start_time)
           - 외과의사 확인 시간 (end_time)
           - Tissue ID time = end_time - start_time
           """
           self.session['tissue_id_events'].append({
               'timestamp': timestamp,
               'tissue': tissue_type,
               'confidence': ai_confidence,
               'duration_ms': None  # Calculated post-op
           })
   ```

2. **REDCap 연동:**
   ```python
   # redcap_integration.py
   import requests
   
   def upload_case_to_redcap(session_data):
       """
       IRB-approved REDCap project에 자동 업로드
       """
       api_url = 'https://redcap.paradigm.edu/api/'
       api_token = os.environ['REDCAP_API_TOKEN']
       
       data = {
           'token': api_token,
           'content': 'record',
           'format': 'json',
           'type': 'flat',
           'data': json.dumps([{
               'record_id': session_data['patient_id'],
               'surgeon': session_data['surgeon'],
               'operative_time': session_data['end_time'] - session_data['start_time'],
               'ai_usage_percent': session_data['ai_usage_percent'],
               'tissue_id_time_avg': calculate_avg_tissue_id_time(session_data)
           }])
       }
       
       response = requests.post(api_url, data=data)
       return response.json()
   ```

3. **DSMB Dashboard (Grafana):**
   ```yaml
   # grafana_dashboard.yaml
   dashboard:
     title: "EQR AI Clinical Study - Safety Monitoring"
     panels:
       - title: "Enrollment Progress"
         type: gauge
         targets:
           - expr: current_enrollment / target_enrollment * 100
         thresholds:
           - value: 0, color: red
           - value: 50, color: yellow
           - value: 100, color: green
       
       - title: "Adverse Events"
         type: graph
         targets:
           - expr: sum(adverse_events) by (severity)
         alert:
           conditions:
             - type: threshold
               value: 3  # Alert DSMB if ≥3 SAEs
       
       - title: "AI Performance (Real-Time)"
         type: stat
         targets:
           - expr: avg(ai_accuracy_surgeon_validated)
           - expr: avg(ai_latency_ms)
   ```

**개발팀 성공 기준:**
- [ ] 자동 데이터 수집 100% 작동 (N=60 cases)
- [ ] REDCap 연동 테스트 (N=5 test cases)
- [ ] DSMB dashboard 실시간 업데이트
- [ ] 시스템 uptime ≥99% (8hr 수술일 기준, 다운타임 <5분/day)

---

### 3️⃣ **임상 연구팀 (Clinical Research Team)**

#### 🎯 핵심 니즈
> "IRB 승인을 받고, 60명 환자 데이터를 FDA 제출 가능한 수준으로 수집할 수 있는가?"

#### Phase 0: 기술 검증 (Week 1-4)

**제공 서비스: "IRB Pre-Submission Consultation"**

**Milestone 1: Protocol Template 커스터마이징**
- `IRB_Submission_Package.md` Section 2 (Research Protocol) 사용
- PI (Principal Investigator)와 함께 검토:
  - Inclusion/Exclusion criteria 현실적인가?
  - Primary endpoint 측정 가능한가?
  - Sample size 충분한가? (N=60 vs N=100?)

**Milestone 2: Informed Consent Form 최적화**
- 환자 친화적 언어 검증 (Flesch-Kincaid Grade 8)
- 병원 legal department 검토
- 환자 advocate 리뷰 (읽기 쉬운가?)

**Milestone 3: Historical Controls 데이터 수집**
```python
# historical_controls.py
import pandas as pd

def collect_historical_controls():
    """
    2023-2024 ESD cases from PARADIGM database (without AI)
    Match on:
    - Lesion size (2-5 cm)
    - Location (colon, stomach)
    - Surgeon experience (>50 robotic cases)
    """
    query = """
    SELECT 
        patient_id,
        lesion_size_cm,
        location,
        surgeon_id,
        operative_time_min,
        estimated_blood_loss_ml,
        complications,
        video_path
    FROM paradigm_surgical_database
    WHERE 
        procedure_type = 'Robotic ESD'
        AND date BETWEEN '2023-01-01' AND '2024-12-31'
        AND lesion_size_cm BETWEEN 2 AND 5
        AND location IN ('Colon', 'Stomach')
    ORDER BY date DESC
    LIMIT 60
    """
    return pd.read_sql(query, db_connection)

controls = collect_historical_controls()

# Video review: 2 blinded reviewers measure tissue ID time
for video_path in controls['video_path']:
    tissue_id_times = measure_tissue_id_time_manual(video_path)
    # Avg: 15.0 seconds (baseline for 30% reduction hypothesis)
```

**임상팀 성공 기준:**
- [ ] Protocol draft finalized (Week 3)
- [ ] Informed consent IRB-compliant (Week 4)
- [ ] Historical controls data ready (N=60, Week 4)

---

#### Phase 1: 핵심 가치 MVP (Week 5-12)

**제공 서비스: "IRB Submission Package"**

**Milestone 1: IRB Submission (Week 10)**
- Complete package: Protocol + Consent + Investigator Brochure + FMEA
- Submit to PARADIGM Institution #1 IRB
- Anticipate 90-day review (Week 10 → Week 22 approval)

**Milestone 2: Site Preparation (Week 10-12)**
- Identify champion surgeon (high-volume, research-interested)
- Train OR staff (nurses, anesthesiologists) on AI system
- Mock case rehearsal (phantom tissue, no patient)

**Milestone 3: Regulatory Documentation**
```markdown
# NSR (Non-Significant Risk) Device Determination

Per 21 CFR 812.3(m), the EQR AI-Integrated Surgical System qualifies as NSR because:

1. **Not Implanted:** Device is external (attached to robotic console)
2. **Not Life-Supporting:** Surgery proceeds safely without AI
3. **Not Introduced into Body:** AI processes video, no patient contact
4. **Limited Risk:** AI is advisory only; surgeon retains full control

**Conclusion:** NSR determination allows abbreviated IDE (no FDA submission required pre-study).

**Submitted to IRB:** [Date]
**IRB Approval:** Pending (90-day review)
```

**임상팀 성공 기준:**
- [ ] IRB submission complete (Week 10)
- [ ] Site preparation complete (Week 12)
- [ ] Regulatory documentation approved by IRB (Week 22)

---

#### Phase 2: 임상 검증 MVP (Week 13-24)

**제공 서비스: "Clinical Data Management System"**

**Milestone 1: Patient Recruitment (Week 13-24)**

**Recruitment Strategy:**
```
Target: N=60 patients over 12 months (5 patients/month)

Eligibility Screening:
1. Surgical scheduler identifies ESD candidates (pre-op clinic)
2. Inclusion criteria check (age ≥18, lesion 2-5cm, ASA I-III)
3. Study coordinator approaches patient (informed consent discussion)
4. Consent signed → Patient enrolled

Realistic Timeline:
- Month 1-2: Slow start (1-2 patients/month, learning curve)
- Month 3-6: Ramp up (4-5 patients/month)
- Month 7-12: Steady state (5-6 patients/month)
```

**Milestone 2: Data Collection (Real-Time)**

**Automated Data Capture:**
- System logs (AI usage, latency, errors)
- Video recordings (de-identified, encrypted)
- Surgeon questionnaires (post-op, SUS + NASA-TLX)

**Manual Data Entry (REDCap):**
- Patient demographics (age, BMI, ASA class)
- Intraoperative events (bleeding, perforation)
- 30-day follow-up (complications, pathology)

**Milestone 3: Data Analysis (Ongoing)**

```python
# primary_endpoint_analysis.py
import pandas as pd
from scipy.stats import ttest_ind

# AI Group (N=60, prospective)
ai_group = pd.read_csv('ai_assisted_cases.csv')
ai_tissue_id_time = ai_group['tissue_id_time_avg_sec']

# Historical Controls (N=60, retrospective)
control_group = pd.read_csv('historical_controls.csv')
control_tissue_id_time = control_group['tissue_id_time_avg_sec']

# Statistical Test: Two-sample t-test
t_stat, p_value = ttest_ind(ai_tissue_id_time, control_tissue_id_time)

print(f"AI Group Mean: {ai_tissue_id_time.mean():.2f} sec")
print(f"Control Group Mean: {control_tissue_id_time.mean():.2f} sec")
print(f"Reduction: {(1 - ai_tissue_id_time.mean() / control_tissue_id_time.mean()) * 100:.1f}%")
print(f"p-value: {p_value:.4f}")

# Success: p < 0.05 AND reduction ≥ 30%
if p_value < 0.05 and (ai_tissue_id_time.mean() / control_tissue_id_time.mean()) <= 0.70:
    print("✓ PRIMARY ENDPOINT ACHIEVED")
else:
    print("✗ Primary endpoint not met")
```

**임상팀 성공 기준:**
- [ ] N=60 patients enrolled (Month 24)
- [ ] Primary endpoint achieved (p<0.05, 30% reduction)
- [ ] Safety: complications non-inferior (≤5% difference)
- [ ] Manuscript submitted (JAMA Surgery, Month 26)

---

### 4️⃣ **규제팀 (Regulatory Affairs Team)**

#### 🎯 핵심 니즈
> "FDA 510(k) 승인을 받을 수 있도록 모든 문서를 준비하고, PCCP 전략을 실행할 수 있는가?"

#### Phase 0: 기술 검증 (Week 1-4)

**제공 서비스: "Regulatory Strategy Validation"**

**Milestone 1: Predicate Device Analysis**
- da Vinci Xi (K140129) 510(k) 승인 문서 분석
- FDA 승인 조건, 제한사항 파악
- 우리 시스템과의 차이점 명확화

**Milestone 2: FDA Pre-Submission Meeting Preparation**
- Q-Sub package 초안 (30-50 pages)
- 5 key questions 준비:
  1. Predicate appropriateness?
  2. Clinical data sufficiency (N=60 single-arm)?
  3. PCCP acceptability?
  4. AI/ML documentation requirements?
  5. Cybersecurity concerns for LLM devices?

**규제팀 성공 기준:**
- [ ] Predicate comparison table complete (Week 2)
- [ ] Q-Sub package draft ready (Week 4)

---

#### Phase 1: 핵심 가치 MVP (Week 5-12)

**제공 서비스: "QMS (Quality Management System) Foundation"**

**Milestone 1: ISO 13485 Consultant Engagement**
- Emergo by UL 계약 체결 (Week 5)
- QMS kickoff meeting (Week 6)

**Milestone 2: Essential SOPs (Top 5)**
1. **SOP-001: Design Controls (21 CFR 820.30)**
   - Design input (user needs)
   - Design output (specifications)
   - Design verification (testing)
   - Design validation (clinical study)
   
2. **SOP-002: Document Control**
   - Version management (Git for code, SharePoint for docs)
   - Approval workflow (author → reviewer → approver)
   - Change control (ECO - Engineering Change Order)

3. **SOP-003: CAPA (Corrective/Preventive Action)**
   - Issue identification (bugs, complaints, adverse events)
   - Root cause analysis (5 Whys, Fishbone diagram)
   - Corrective action (fix the problem)
   - Preventive action (prevent recurrence)
   - Verification (did it work?)

4. **SOP-004: Risk Management (ISO 14971)**
   - Hazard identification (brainstorming)
   - Risk analysis (FMEA, RPN calculation)
   - Risk control (mitigations)
   - Residual risk evaluation (acceptable?)

5. **SOP-005: Software Validation (IEC 62304)**
   - Software requirements (SRS)
   - Software design (SDD)
   - Unit testing (90% code coverage)
   - Integration testing
   - System testing (V&V)

**Milestone 3: Design History File (DHF) Setup**
```
DHF Structure (SharePoint/Google Drive):
├── 01_Design_Requirements/
│   ├── DRS_001_System_Requirements.docx
│   ├── DRS_002_Software_Requirements.docx
│   └── DRS_003_Hardware_Requirements.docx
├── 02_Design_Specifications/
│   ├── DS_001_System_Architecture.docx
│   ├── DS_002_Software_Design.docx
│   └── DS_003_Hardware_Specifications.xlsx
├── 03_Verification_Testing/
│   ├── VTP_001_FPGA_Safety_Layer.docx (Phase 2)
│   ├── VTP_002_Vision_AI_Performance.docx
│   └── Test_Reports/
├── 04_Validation_Testing/
│   ├── Clinical_Study_Protocol.docx
│   └── Clinical_Study_Report.docx (Month 26)
├── 05_Design_Reviews/
│   ├── DR1_Concept_Review_Minutes.docx
│   ├── DR2_Preliminary_Design_Review.docx
│   └── DR3_Final_Design_Review.docx
└── 06_Design_Transfer/
    ├── Manufacturing_Procedures.docx
    └── Installation_Qualification.docx
```

**규제팀 성공 기준:**
- [ ] ISO 13485 consultant engaged (Week 5)
- [ ] Top 5 SOPs drafted (Week 12)
- [ ] DHF structure created (Week 8)
- [ ] Mock FDA audit passed (internal, Week 12)

---

#### Phase 2: 임상 검증 MVP (Week 13-24)

**제공 서비스: "510(k) Submission Preparation"**

**Milestone 1: Risk Management File**
- FMEA complete (50-100 hazards, Week 16)
- Risk control measures implemented
- Residual risk assessment

**Milestone 2: Software Documentation**
- Software Requirements Spec (SRS, 40-60 pages, Week 18)
- Software Design Document (SDD, 30 pages, Week 20)
- Software V&V Report (50-75 pages, Week 22)

**Milestone 3: Cybersecurity Documentation**
- SBOM (Software Bill of Materials, Week 20)
- Threat modeling (STRIDE analysis, Week 21)
- Penetration test results (Week 22)

**규제팀 성공 기준:**
- [ ] Risk management file complete (Week 16)
- [ ] Software documentation complete (Week 22)
- [ ] Cybersecurity audit passed (Week 22)
- [ ] 510(k) submission package 80% complete (Week 24)

---

## 🎯 MVP 서비스 우선순위 매트릭스

### 우선순위 결정 기준

```
High Impact, Low Effort (Quick Wins) → DO FIRST
├── 1. Web-based AI Demo (외과의사 팀, Week 1-4)
├── 2. Historical Controls Data Collection (임상팀, Week 1-4)
└── 3. Predicate Device Analysis (규제팀, Week 1-2)

High Impact, High Effort (Major Projects) → DO SECOND
├── 4. Real-Time AI Overlay System (개발팀, Week 5-12)
├── 5. IRB Submission Package (임상팀, Week 5-12)
└── 6. QMS Foundation (규제팀, Week 5-12)

Low Impact, Low Effort (Fill-ins) → DO IF TIME PERMITS
├── 7. iPad Control App (개발팀, Week 7-8)
└── 8. DSMB Dashboard (개발팀, Week 13-16)

Low Impact, High Effort (Avoid for MVP) → DEFER TO PHASE 2
├── FPGA Hardware Safety Layer (불필요, AI는 advisory only)
├── Edge AI Knowledge Assistant (GPT-4o-mini, 부차적 기능)
└── Cloud AI Pre/Post-Op Analysis (GPT-5 Pro, Nice-to-have)
```

---

## 📊 리소스 배분 (12주 MVP)

### 팀 구성 (5 FTEs)

| Role | FTE | Weeks 1-4 | Weeks 5-8 | Weeks 9-12 |
|------|-----|-----------|-----------|------------|
| **AI Engineer** | 1.0 | YOLOv8 training | Real-time pipeline | Bug fixes + optimization |
| **Software Engineer** | 0.5 | Data pipeline | iPad app | Integration testing |
| **Clinical Scientist** | 1.0 | Historical controls | IRB submission | Site preparation |
| **Regulatory Specialist** | 0.5 | Predicate analysis | SOP drafting | Mock FDA audit |
| **Project Manager** | 0.5 | Kickoff + planning | Sprint management | Review + reporting |

### 예산 배분 (12주 = 3개월)

| Category | Month 1 | Month 2 | Month 3 | Total |
|----------|---------|---------|---------|-------|
| **Personnel** | $94K | $94K | $94K | $282K |
| **Hardware** | $20K (Jetson, camera) | $5K | $0 | $25K |
| **Cloud/Software** | $5K | $5K | $5K | $15K |
| **Travel** | $3K (site visits) | $3K | $3K | $9K |
| **Contingency** | $12K | $11K | $10K | $33K |
| **TOTAL** | **$134K** | **$118K** | **$112K** | **$364K** |

---

## ✅ 최종 권장사항

### MVP Phase 1 (Week 1-12) 목표

**외과의사 팀:**
- ✅ Week 4: AI Demo 체험 (10명 외과의사, 70% "실제 수술에서 사용하고 싶다")
- ✅ Week 12: Real-Time Overlay 시스템 완성 (5 cases 완료, 만족도 100%)

**개발팀:**
- ✅ Week 4: YOLOv8 학습 완료 (mAP ≥85%)
- ✅ Week 8: Real-time inference <35ms (Jetson AGX Orin)
- ✅ Week 12: OR integration 완료 (시스템 안정성 검증)

**임상팀:**
- ✅ Week 4: Historical controls data ready (N=60)
- ✅ Week 10: IRB submission complete
- ✅ Week 12: Site preparation 완료 (champion surgeon trained)

**규제팀:**
- ✅ Week 4: Q-Sub package draft ready
- ✅ Week 12: Top 5 SOPs drafted, DHF structure created

### 성공 지표 (Week 12 Review)

| Metric | Target | RAG |
|--------|--------|-----|
| **외과의사 수용성** | "다음 케이스에도 사용" 100% | 🟢 |
| **AI 정확도** | mAP ≥85%, 외과의사 체감 ≥70% | 🟢 |
| **시스템 안정성** | Uptime ≥95%, 중대 실패 0건 | 🟢 |
| **IRB 진행** | 제출 완료, 90-day 심사 진행 중 | 🟢 |
| **예산** | $364K 사용, variance <10% | 🟢 |

**Decision Point (Week 12):**
- ✅ **모든 지표 Green:** Proceed to Phase 2 (Clinical Validation, N=60 enrollment)
- 🟡 **1-2개 Yellow:** Address issues, delay Phase 2 by 4 weeks
- 🔴 **Any Red:** Pause, pivot strategy, or terminate project

---

**문서 버전:** 1.0  
**작성일:** 2025-Q2  
**다음 검토:** Week 4 (Phase 0 Complete), Week 12 (Phase 1 Complete)
