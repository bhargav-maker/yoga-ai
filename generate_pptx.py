import os
import sys

try:
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN
    from pptx.enum.shapes import MSO_SHAPE
except ImportError:
    print("python-pptx not installed yet")
    sys.exit(1)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Colors
C_DARK = RGBColor(15, 23, 42)        # Slate 900
C_PRIMARY = RGBColor(16, 185, 129)   # Emerald 500
C_ACCENT = RGBColor(14, 165, 233)    # Sky 500
C_WHITE = RGBColor(255, 255, 255)
C_MUTED = RGBColor(148, 163, 184)    # Slate 400
C_CARD_BG = RGBColor(30, 41, 59)     # Slate 800
C_PURPLE = RGBColor(168, 85, 247)
C_AMBER = RGBColor(245, 158, 11)
C_RED = RGBColor(239, 68, 68)

def set_slide_background(slide, color=C_DARK):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = color
    bg.line.fill.background()
    return bg

def add_header(slide, title_text, category="YOGA AI • EXHIBITION 2026"):
    cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
    tf_cat = cat_box.text_frame
    tf_cat.word_wrap = True
    p_cat = tf_cat.paragraphs[0]
    p_cat.text = category.upper()
    p_cat.font.size = Pt(11)
    p_cat.font.bold = True
    p_cat.font.color.rgb = C_PRIMARY

    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.8))
    tf_title = title_box.text_frame
    tf_title.word_wrap = True
    p_title = tf_title.paragraphs[0]
    p_title.text = title_text
    p_title.font.size = Pt(28)
    p_title.font.bold = True
    p_title.font.color.rgb = C_WHITE

def create_card(slide, left, top, width, height, title, text_items, accent_color=C_PRIMARY):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = C_CARD_BG
    card.line.color.rgb = accent_color
    card.line.width = Pt(1.5)

    txBox = slide.shapes.add_textbox(left + Inches(0.3), top + Inches(0.3), width - Inches(0.6), height - Inches(0.6))
    tf = txBox.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = title
    p0.font.size = Pt(18)
    p0.font.bold = True
    p0.font.color.rgb = accent_color
    p0.space_after = Pt(14)

    for item in text_items:
        p = tf.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(13)
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(8)

# ----------------- SLIDE 1: Title Slide (with clickable links) -----------------
slide1 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide1, C_DARK)

badge = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.3), Inches(3.6), Inches(0.45))
badge.fill.solid()
badge.fill.fore_color.rgb = C_CARD_BG
badge.line.color.rgb = C_PRIMARY
tf_b = badge.text_frame
p_b = tf_b.paragraphs[0]
p_b.text = "BIOMECHANICAL WELLNESS TECH"
p_b.font.size = Pt(11)
p_b.font.bold = True
p_b.font.color.rgb = C_PRIMARY
p_b.alignment = PP_ALIGN.CENTER

t_box = slide1.shapes.add_textbox(Inches(0.8), Inches(1.95), Inches(11.7), Inches(2.2))
tf_t = t_box.text_frame
p_t = tf_t.paragraphs[0]
p_t.text = "Yoga AI: Poddar Yogis"
p_t.font.size = Pt(46)
p_t.font.bold = True
p_t.font.color.rgb = C_WHITE

p_sub = tf_t.add_paragraph()
p_sub.text = "Next-Gen Intelligent Biomechanical AI Trainer with Real-Time Vision & Voice Coaching"
p_sub.font.size = Pt(20)
p_sub.font.color.rgb = C_ACCENT
p_sub.space_before = Pt(10)

meta_box = slide1.shapes.add_textbox(Inches(0.8), Inches(4.7), Inches(11.7), Inches(2.2))
tf_meta = meta_box.text_frame

p_m = tf_meta.paragraphs[0]
p_m.text = "Presented by: Bhargav & Team  |  District Science Exhibition 2026"
p_m.font.size = Pt(15)
p_m.font.color.rgb = C_MUTED

# Clickable Local Link
p_m_link1 = tf_meta.add_paragraph()
p_m_link1.space_before = Pt(12)
run_lbl1 = p_m_link1.add_run()
run_lbl1.text = "🌐 Launch Application: "
run_lbl1.font.size = Pt(15)
run_lbl1.font.bold = True
run_lbl1.font.color.rgb = C_WHITE

run_url1 = p_m_link1.add_run()
run_url1.text = "http://localhost:3000"
run_url1.font.size = Pt(15)
run_url1.font.bold = True
run_url1.font.color.rgb = C_ACCENT
run_url1.font.underline = True
run_url1.hyperlink.address = "http://localhost:3000"

# Clickable GitHub Link
p_m_link2 = tf_meta.add_paragraph()
p_m_link2.space_before = Pt(6)
run_lbl2 = p_m_link2.add_run()
run_lbl2.text = "📂 Open Source Repository: "
run_lbl2.font.size = Pt(15)
run_lbl2.font.bold = True
run_lbl2.font.color.rgb = C_WHITE

run_url2 = p_m_link2.add_run()
run_url2.text = "https://github.com/bhargav-maker/yoga-ai"
run_url2.font.size = Pt(15)
run_url2.font.bold = True
run_url2.font.color.rgb = C_PRIMARY
run_url2.font.underline = True
run_url2.hyperlink.address = "https://github.com/bhargav-maker/yoga-ai"

# ----------------- SLIDE 2: Problem & Motivation -----------------
slide2 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide2)
add_header(slide2, "The Challenge: Safe, Guided Home Yoga Practice")

create_card(slide2, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8), 
            "1. Incorrect Form & Injury", 
            ["Performing asanas without supervision causes chronic spine, knee, and neck hyperextension.",
             "Users cannot self-assess joint alignment or pelvic tilt while stretching.",
             "Lack of posture feedback ingrains flawed biomechanical patterns into muscle memory."], 
            C_RED)

create_card(slide2, Inches(4.85), Inches(1.8), Inches(3.6), Inches(4.8), 
            "2. Trainer Inaccessibility", 
            ["Certified 1-on-1 yoga gurus are financially prohibitive ($50-$100/session) and time-inflexible.",
             "Generic YouTube video tutorials offer zero interactive correction or holding feedback.",
             "Over 70% of beginners abandon home yoga routines within 3 weeks due to lack of coaching."], 
            C_AMBER)

create_card(slide2, Inches(8.9), Inches(1.8), Inches(3.6), Inches(4.8), 
            "3. Camera Privacy & Cloud Lag", 
            ["Cloud-based computer vision streams home camera feeds to remote servers, violating domestic privacy.",
             "Network round-trip latency (300-500ms) causes choppy, frustrating feedback loops.",
             "High computational cost makes cloud streaming commercially unsustainable."], 
            C_ACCENT)

# ----------------- SLIDE 3: The Complete Solution & Architecture -----------------
slide3 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide3)
add_header(slide3, "The Solution: End-to-End Client-Side AI Pipeline")

create_card(slide3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(2.35),
            "1. MoveNet Lightning Tracking",
            ["Google MoveNet Lightning model extracts 17 skeletal landmarks per frame.",
             "Runs at 30-60 FPS smoothly using WebGL hardware acceleration.",
             "Precision confidence thresholding (>0.25) eliminates jittery background noise."],
            C_PRIMARY)

create_card(slide3, Inches(6.9), Inches(1.8), Inches(5.6), Inches(2.35),
            "2. 100% Private On-Device AI",
            ["All neural network inference executes purely inside the client's browser.",
             "Webcam video NEVER leaves the local machine — total domestic privacy.",
             "Zero server latency and works completely offline without internet connectivity."],
            C_ACCENT)

create_card(slide3, Inches(0.8), Inches(4.45), Inches(5.6), Inches(2.35),
            "3. Biomechanical Geometry Engine",
            ["Vector trigonometric calculations of joint angles (knees, hips, elbows, spine).",
             "Center of gravity & lateral sway velocity monitoring for balance tracking.",
             "Temporal moving-average window to prevent sporadic frame flickers."],
            C_PURPLE)

create_card(slide3, Inches(6.9), Inches(4.45), Inches(5.6), Inches(2.35),
            "4. Multi-Layer Neural Classifier",
            ["Normalized 34-dimensional feature vector fed into custom TensorFlow.js DNN.",
             "Real-time probability distribution matched against 7 classical asanas.",
             "Seamless integration between neural classification and geometric validation."],
            C_AMBER)

# ----------------- SLIDE 4: 7 Biomechanical AI Superpowers -----------------
slide4 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide4)
add_header(slide4, "7 Biomechanical AI Superpowers: True Studio Intelligence")

bio_left = [
    "🎙️ Real-Time Spoken Audio Coach: Hands-free vocal corrections (e.g. 'Raise right thigh higher!') via Web Speech Synthesis.",
    "⚖️ Stability & Balance Score: Tracks center of gravity and lateral sway velocity to measure neuromuscular balance in real time.",
    "📐 Slope Symmetry & Spinal Tilt: Analyzes shoulder and hip horizontal vectors to prevent pelvic skew and lateral spine bending.",
    "🛡️ Hyperextension Injury Prevention: Detects knee and elbow over-straightening (>178°) and warns against joint lock-out."
]

bio_right = [
    "🫁 Pranayama Breathing Synchronization: 4-4-4 rhythm animated breathing orb dynamically aligns lung cycles with asana holding.",
    "📊 Automated Diagnostic Scorecard: 10-second auto-closing modal detailing Hold Time, Alignment Score, and biomechanical tips.",
    "🎯 Accuracy & Noise Filtering: Exponential moving average filters camera noise for rock-solid, jitter-free joint tracking."
]

create_card(slide4, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
            "Dynamic Kinetic Guidance", bio_left, C_PRIMARY)

create_card(slide4, Inches(6.9), Inches(1.8), Inches(5.6), Inches(5.0),
            "Holistic Wellness & Safety", bio_right, C_ACCENT)

# ----------------- SLIDE 5: Asana Difficulty Tiers -----------------
slide5 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide5)
add_header(slide5, "Supported Asanas & Progressive Difficulty Tiers")

create_card(slide5, Inches(0.8), Inches(1.8), Inches(3.6), Inches(5.0),
            "🟢 Beginner Tiers",
            ["🐍 Cobra Pose (Bhujangasana): Floor-supported chest opener & thoracic spine flexibility.",
             "🪑 Chair Pose (Utkatasana): Powerful thigh & glute builder; knee bend alignment at 90°-140°.",
             "Focus: Foundational posture grounding, spine awakening, and deep breathing."],
            C_PRIMARY)

create_card(slide5, Inches(4.85), Inches(1.8), Inches(3.6), Inches(5.0),
            "🟡 Intermediate Tiers",
            ["🌳 Tree Pose (Vrikshasana): Single-leg unipedal balance; hip abduction and pelvic leveling.",
             "⚔️ Warrior Pose (Virabhadrasana): Deep lunge stability, square hips, and horizontal arms.",
             "🐕 Downward Dog (Adho Mukha): Inversion stretch decompressing spine and lengthening hamstrings."],
            C_AMBER)

create_card(slide5, Inches(8.9), Inches(1.8), Inches(3.6), Inches(5.0),
            "🔴 Advanced Tiers",
            ["🤸 Shoulderstand (Sarvangasana): Full inverted shoulder stand; thyroid stimulation & circulation.",
             "📐 Triangle Pose (Trikonasana): Compound lateral hamstring stretch & core rotational stability.",
             "Focus: Advanced neuromuscular balance, deep core stabilization, and inverted endurance."],
            C_PURPLE)

# ----------------- SLIDE 6: Modern Dark Studio UI & Real-Time HUD -----------------
slide6 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide6)
add_header(slide6, "Modern Dark Studio Experience & Heads-Up Display (HUD)")

create_card(slide6, Inches(0.8), Inches(1.8), Inches(5.6), Inches(2.35),
            "Heads-Up Camera Overlay",
            ["Translucent glassmorphism pill floating directly on the live camera canvas.",
             "Real-time FPS telemetry, Accuracy Percentage, and Stability gauge.",
             "Live In-Frame Guidance Toast alerting user to angle adjustments."],
            C_ACCENT)

create_card(slide6, Inches(6.9), Inches(1.8), Inches(5.6), Inches(2.35),
            "Uncropped Reference Studio",
            ["Reference pose card maintains complete aspect ratio (object-fit: contain).",
             "Users see full target body silhouette without any clipped limbs or cut-off heads.",
             "Target angle guidelines visually explained next to the video feed."],
            C_PRIMARY)

create_card(slide6, Inches(0.8), Inches(4.45), Inches(5.6), Inches(2.35),
            "Safe Frame-Delta Timer",
            ["Precision performance timer using frame-delta timestamp accumulation.",
             "Eliminated uninitialized Unix epoch subtraction bugs (no 1793358968s glitch).",
             "Strict hold timer only advances when posture satisfies biomechanical criteria."],
            C_PURPLE)

create_card(slide6, Inches(6.9), Inches(4.45), Inches(5.6), Inches(2.35),
            "Full-Body Skeleton Rendering",
            ["17-landmark interconnected bone lines rendered in bright emerald green.",
             "Lower confidence fallback preserves connected limb structure during occlusion.",
             "Joint highlight circles show exact pivot points for hips, knees, and shoulders."],
            C_AMBER)

# ----------------- SLIDE 7: Masterclass Tutorials -----------------
slide7 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide7)
add_header(slide7, "Tutorials Masterclass: Comprehensive Pose Academy")

create_card(slide7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
            "Step-by-Step Pose Guides",
            ["Complete dedicated Academy page covering all 7 classical asanas.",
             "Target anatomical focus badges (Balance, Core, Spine, Legs, Inversion).",
             "Numbered phase-by-phase execution instructions from setup to release.",
             "Breathing coordination advice (inhale during expansion, exhale during folds).",
             "Common mistakes highlighted to protect vulnerable joints."],
            C_PRIMARY)

create_card(slide7, Inches(6.9), Inches(1.8), Inches(5.6), Inches(5.0),
            "Camera Calibration & Best Practices",
            ["Full-Body Framing: How to position webcam 6–8 feet away for full head-to-toe capture.",
             "Optimal Studio Lighting: Ensuring front-facing ambient light without backlighting glare.",
             "Clothing Guidance: Recommending form-fitting workout attire for crisp keypoint detection.",
             "One-Click Direct Launch: 'Practice Now' buttons jump instantly into the live AI studio."],
            C_ACCENT)

# ----------------- SLIDE 8: Analytics, Performance Trend & Diagnostic Modal -----------------
slide8 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide8)
add_header(slide8, "Analytics, Progress Tracking & Session Diagnostics")

create_card(slide8, Inches(0.8), Inches(1.8), Inches(5.6), Inches(2.35),
            "Pose Accuracy Bar Graph",
            ["Interactive horizontal comparison bars tracking accuracy % per asana.",
             "Visual breakdown shows user's strongest postures and areas needing practice.",
             "Color-coded thresholds (Emerald = Excellent, Amber = Good, Sky = Practice)."],
            C_PRIMARY)

create_card(slide8, Inches(6.9), Inches(1.8), Inches(5.6), Inches(2.35),
            "Performance Trend SVG Line Chart",
            ["Historical accuracy timeline plotted over practice sessions.",
             "Shows verifiable progress and stability improvement curves across days.",
             "Smooth vector rendering directly in browser with interactive data points."],
            C_ACCENT)

create_card(slide8, Inches(0.8), Inches(4.45), Inches(5.6), Inches(2.35),
            "Automated Diagnostic Scorecard",
            ["Displays immediately upon session completion or clicking Stop Pose.",
             "10-second auto-close timer with smart hover/click pause detection.",
             "Detailed breakdown: Total Hold Duration, Biomechanical Score, and Tips.",
             "Fully scrollable modal prevents overflow on smaller laptop screens."],
            C_PURPLE)

create_card(slide8, Inches(6.9), Inches(4.45), Inches(5.6), Inches(2.35),
            "Persistent Local Storage",
            ["Session history and personal best hold streaks stored securely in browser.",
             "Zero server dependency: records persist across browser reloads without cloud DB.",
             "Exportable summary stats for student practice logs and science exhibitions."],
            C_AMBER)

# ----------------- SLIDE 9: Technology Stack & Engineering Excellence -----------------
slide9 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide9)
add_header(slide9, "Technical Stack & Engineering Highlights")

create_card(slide9, Inches(0.8), Inches(1.8), Inches(3.6), Inches(5.0),
            "Frontend Architecture",
            ["React 18 Single-Page Application with React Router v6.",
             "HTML5 Hardware-Accelerated 2D Canvas rendering engine.",
             "Custom Dark Studio CSS styling with frosted glassmorphism.",
             "Web Audio API & Web Speech Synthesis API for hands-free audio."],
            C_PRIMARY)

create_card(slide9, Inches(4.85), Inches(1.8), Inches(3.6), Inches(5.0),
            "AI & Computer Vision",
            ["Google MoveNet Lightning: Single-pose 17-keypoint detector.",
             "TensorFlow.js WebGL backend achieving 45-60 FPS on standard laptops.",
             "Custom Multi-Layer Neural Classifier for posture verification.",
             "Geometric Vector Angle & Slope Biomechanical calculation library."],
            C_ACCENT)

create_card(slide9, Inches(8.9), Inches(1.8), Inches(3.6), Inches(5.0),
            "Deployment & Automation",
            ["One-Click Launcher scripts (start.bat / yoga.bat) for zero-config startup.",
             "Instant Production Server with zero cloud hosting costs.",
             "Robust Git version control synced to GitHub repository.",
             "100% Client-Side Privacy: zero personal camera data transmitted."],
            C_PURPLE)

# ----------------- SLIDE 10: Conclusion & Live Demonstration (with clickable links) -----------------
slide10 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide10)

tb_c = slide10.shapes.add_textbox(Inches(0.8), Inches(1.0), Inches(11.7), Inches(2.0))
tfc = tb_c.text_frame
p = tfc.paragraphs[0]
p.text = "Thank You!"
p.font.size = Pt(48)
p.font.bold = True
p.font.color.rgb = C_PRIMARY

p2 = tfc.add_paragraph()
p2.text = "Yoga AI: Empowering Personal Wellness with Private On-Device Biomechanical AI"
p2.font.size = Pt(22)
p2.font.color.rgb = C_WHITE
p2.space_before = Pt(10)

box_demo = slide10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(3.3), Inches(11.7), Inches(3.5))
box_demo.fill.solid()
box_demo.fill.fore_color.rgb = C_CARD_BG
box_demo.line.color.rgb = C_ACCENT
box_demo.line.width = Pt(1.5)

tfd = box_demo.text_frame
pd1 = tfd.paragraphs[0]
pd1.text = "Ready for Live Exhibition Demonstration!"
pd1.font.size = Pt(24)
pd1.font.bold = True
pd1.font.color.rgb = C_ACCENT
pd1.space_after = Pt(16)

# Clickable Web App Link in Slide 10
pd2 = tfd.add_paragraph()
pd2.space_after = Pt(10)
run_d1_lbl = pd2.add_run()
run_d1_lbl.text = "🚀 Live Web Application: "
run_d1_lbl.font.size = Pt(18)
run_d1_lbl.font.bold = True
run_d1_lbl.font.color.rgb = C_WHITE

run_d1_url = pd2.add_run()
run_d1_url.text = "http://localhost:3000"
run_d1_url.font.size = Pt(18)
run_d1_url.font.bold = True
run_d1_url.font.color.rgb = C_ACCENT
run_d1_url.font.underline = True
run_d1_url.hyperlink.address = "http://localhost:3000"

# Clickable GitHub Link in Slide 10
pd3 = tfd.add_paragraph()
pd3.space_after = Pt(10)
run_d2_lbl = pd3.add_run()
run_d2_lbl.text = "💻 GitHub Repository: "
run_d2_lbl.font.size = Pt(18)
run_d2_lbl.font.bold = True
run_d2_lbl.font.color.rgb = C_WHITE

run_d2_url = pd3.add_run()
run_d2_url.text = "https://github.com/bhargav-maker/yoga-ai"
run_d2_url.font.size = Pt(18)
run_d2_url.font.bold = True
run_d2_url.font.color.rgb = C_PRIMARY
run_d2_url.font.underline = True
run_d2_url.hyperlink.address = "https://github.com/bhargav-maker/yoga-ai"

pd4 = tfd.add_paragraph()
pd4.space_before = Pt(6)
pd4.text = "🏆 Open for Q&A, Biomechanical Analysis Review, and Live Camera Trials"
pd4.font.size = Pt(16)
pd4.font.color.rgb = C_MUTED

output_path = os.path.join(os.getcwd(), "Yoga_AI_Presentation.pptx")
prs.save(output_path)
print(f"SUCCESS: Saved presentation to {output_path}")
