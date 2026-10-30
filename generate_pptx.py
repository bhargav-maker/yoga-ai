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

# Color Palette (Futuristic Dark Studio Theme)
C_DARK = RGBColor(15, 23, 42)        # Slate 900
C_PRIMARY = RGBColor(16, 185, 129)   # Emerald 500
C_ACCENT = RGBColor(14, 165, 233)    # Sky 500
C_PURPLE = RGBColor(168, 85, 247)    # Purple 500
C_AMBER = RGBColor(245, 158, 11)     # Amber 500
C_RED = RGBColor(239, 68, 68)        # Red 500
C_WHITE = RGBColor(255, 255, 255)
C_MUTED = RGBColor(203, 213, 225)    # Slate 300 (high contrast readability)
C_CARD_BG = RGBColor(30, 41, 59)     # Slate 800
C_CARD_BORDER = RGBColor(51, 65, 85) # Slate 700

def set_slide_background(slide, color=C_DARK):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = color
    bg.line.fill.background()
    return bg

def add_header(slide, title_text, category="YOGA AI • DISTRICT EXHIBITION 2026"):
    cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.35))
    tf_cat = cat_box.text_frame
    tf_cat.word_wrap = True
    p_cat = tf_cat.paragraphs[0]
    p_cat.text = category.upper()
    p_cat.font.size = Pt(11)
    p_cat.font.bold = True
    p_cat.font.color.rgb = C_PRIMARY

    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.75))
    tf_title = title_box.text_frame
    tf_title.word_wrap = True
    p_title = tf_title.paragraphs[0]
    p_title.text = title_text
    p_title.font.size = Pt(26)
    p_title.font.bold = True
    p_title.font.color.rgb = C_WHITE

def create_card(slide, left, top, width, height, title, text_items, accent_color=C_PRIMARY, title_size=16, item_size=12.5):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = C_CARD_BG
    card.line.color.rgb = accent_color
    card.line.width = Pt(1.5)

    txBox = slide.shapes.add_textbox(left + Inches(0.25), top + Inches(0.2), width - Inches(0.5), height - Inches(0.4))
    tf = txBox.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = title
    p0.font.size = Pt(title_size)
    p0.font.bold = True
    p0.font.color.rgb = accent_color
    p0.space_after = Pt(8)

    for item in text_items:
        p = tf.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(item_size)
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(5)

# ==============================================================================
# SLIDE 1: Title (Sub-Divisional Champion to District Round)
# ==============================================================================
s1 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s1)

badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.9), Inches(6.0), Inches(0.45))
badge.fill.solid()
badge.fill.fore_color.rgb = C_CARD_BG
badge.line.color.rgb = C_PRIMARY
p_b = badge.text_frame.paragraphs[0]
p_b.text = "🏆 SUB-DIVISIONAL 1ST PLACE WINNER → DISTRICT LEVEL ROUND"
p_b.font.size = Pt(11)
p_b.font.bold = True
p_b.font.color.rgb = C_PRIMARY
p_b.alignment = PP_ALIGN.CENTER

t_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(2.3))
tf_t = t_box.text_frame
p_t = tf_t.paragraphs[0]
p_t.text = "Yoga AI: Poddar Yogis"
p_t.font.size = Pt(46)
p_t.font.bold = True
p_t.font.color.rgb = C_WHITE

p_sub = tf_t.add_paragraph()
p_sub.text = "Clinical-Grade Biomechanical Posture Coach & Private Edge AI Trainer"
p_sub.font.size = Pt(21)
p_sub.font.bold = True
p_sub.font.color.rgb = C_ACCENT
p_sub.space_before = Pt(8)

p_desc = tf_t.add_paragraph()
p_desc.text = "Real-Time MoveNet Keypoint Estimation • Anti-Cheating Kinematic Gates • 100% In-Browser & Offline"
p_desc.font.size = Pt(14)
p_desc.font.color.rgb = C_MUTED
p_desc.space_before = Pt(6)

author_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.3), Inches(11.7), Inches(2.6))
author_card.fill.solid()
author_card.fill.fore_color.rgb = C_CARD_BG
author_card.line.color.rgb = C_PRIMARY
tf_ac = author_card.text_frame
p_ac = tf_ac.paragraphs[0]
p_ac.text = "TEAM: Poddar Yogis  |  DEVELOPER: Bhargav  |  REPOSITORY: github.com/bhargav-maker/yoga-ai"
p_ac.font.size = Pt(15)
p_ac.font.bold = True
p_ac.font.color.rgb = C_WHITE

p_stack = tf_ac.add_paragraph()
p_stack.text = "Tech Stack: React 18 • TensorFlow.js • MoveNet Lightning • IndexedDB • Web Speech API • HTML5 Canvas"
p_stack.font.size = Pt(13)
p_stack.font.color.rgb = C_PRIMARY
p_stack.space_before = Pt(8)

p_inno = tf_ac.add_paragraph()
p_inno.text = "Core Innovations: 100% On-Device Biometric Privacy • Zero Cloud Latency (<15ms) • Smart Anti-Cheat Geometry"
p_inno.font.size = Pt(13)
p_inno.font.color.rgb = C_ACCENT
p_inno.space_before = Pt(6)

p_demo = tf_ac.add_paragraph()
p_demo.text = "Live Local Demo URL: http://localhost:3000 (Fully offline production build)"
p_demo.font.size = Pt(13)
p_demo.font.bold = True
p_demo.font.color.rgb = C_PURPLE
p_demo.space_before = Pt(6)

# ==============================================================================
# SLIDE 2: Purpose, Vision & Exhibition Agenda
# ==============================================================================
s2 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s2)
add_header(s2, "Purpose, Clinical Vision & Presentation Agenda")

agenda_items = [
    "1. Clinical Vision: Bringing zero-cost, private posture correction to every household, school, and rural center.",
    "2. Anti-Cheating Technology: Eliminating false positives through strict geometric angle and distance gating.",
    "3. Real-Time Ergonomics: Live 30-60 FPS skeleton tracking, soft-tinted scrollbars, and side-by-side pose guides.",
    "4. Hands-Free Convenience: 10-second auto-closing diagnostic scorecard that auto-persists records to IndexedDB.",
    "5. Longitudinal Analytics: Interactive SVG performance trend charts tracking stability, accuracy, and hold times.",
    "6. Winning Live Demo: A 3-step proof sequence designed specifically for district judge evaluation."
]

vision_items = [
    "Eliminates the risk of acute yoga injuries caused by unsupervised solo workouts.",
    "100% on-device edge execution guarantees student biometric video never leaves the computer.",
    "Sub-15ms feedback loop provides instant auditory corrections before strain develops.",
    "Zero ongoing infrastructure or cloud API cost ensures indefinite scalability."
]

create_card(s2, Inches(0.8), Inches(1.6), Inches(6.5), Inches(5.3),
            "📋 10-Slide Exhibition Journey",
            agenda_items, C_PRIMARY, 16, 12.5)

create_card(s2, Inches(7.6), Inches(1.6), Inches(4.9), Inches(5.3),
            "🎯 Mission & Impact Objectives",
            vision_items, C_ACCENT, 16, 12.5)

# ==============================================================================
# SLIDE 3: The Problem: Hidden Dangers of Solitary Yoga
# ==============================================================================
s3 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s3)
add_header(s3, "The Problem: Hidden Dangers of Solitary Yoga Practice")

create_card(s3, Inches(0.8), Inches(1.6), Inches(5.6), Inches(2.55),
            "⚠️ High Injury Rates in Solo Practice",
            ["Over 60% of solitary yoga practitioners suffer neck, spinal, or knee strains.",
             "Practitioners cannot view a mirror while balancing or twisting without twisting spine.",
             "Without guidance, bad posture is reinforced into permanent muscle memory."],
            C_RED)

create_card(s3, Inches(6.9), Inches(1.6), Inches(5.6), Inches(2.55),
            "💸 Financial & Geographic Inaccessibility",
            ["Personal certified yoga therapists charge $50–$100/hr, unaffordable for common families.",
             "Rural educational institutions lack access to qualified yoga instructors.",
             "Over 70% of beginners give up solo routines due to a lack of feedback."],
            C_AMBER)

create_card(s3, Inches(0.8), Inches(4.35), Inches(5.6), Inches(2.55),
            "🔒 Cloud Privacy Violations & Latency",
            ["Commercial AI apps upload live camera streams to remote servers, violating privacy.",
             "Cloud network latency (300ms–800ms) produces choppy, delayed posture corrections.",
             "High bandwidth requirements cause total failure in rural or offline venues."],
            C_PURPLE)

create_card(s3, Inches(6.9), Inches(4.35), Inches(5.6), Inches(2.55),
            "📺 The Fatal Flaw of YouTube Videos",
            ["Pre-recorded video tutorials provide zero real-time posture feedback.",
             "Users unknowingly cheat poses (unjoined hands, hyper-extended knees, false balance).",
             "Creates a false sense of accomplishment while spinal alignment remains flawed."],
            C_ACCENT)

# ==============================================================================
# SLIDE 4: The 7 Breakthrough Solutions
# ==============================================================================
s4 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s4)
add_header(s4, "The 7 Breakthrough Engineering Solutions")

solutions_col1 = [
    "1. Anti-Cheating Hand & Leg Gates: Hands must be in prayer/overhead; one straight standing leg and one elevated foot required.",
    "2. Natural Biomechanical Tolerances: Relaxed thresholds (wrist distance <65% torso, knee bend >130°) so real human postures score smoothly.",
    "3. Anatomically Continuous Skeleton: Explicit anatomical joint binding (hips to knees to ankles) with green/amber/red color status.",
    "4. Side-by-Side Reference Studio: Target pose reference photo is positioned cleanly next to camera stream across all screen sizes."
]

solutions_col2 = [
    "5. True Stillness Tracking: Center-of-Gravity variance only monitors while in active target pose, ending false 'still' reports.",
    "6. 10-Second Auto-Closing Modal: Displays post-pose diagnostic scorecard with countdown progress bar, pause-on-hover, and auto-dismiss.",
    "7. Full Scrollability & Offline Analytics: Soft-tinted custom scrollbars, always-visible dual SVG charts, and JSON data export."
]

create_card(s4, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.3),
            "🛡️ Core Kinematics & Vision Upgrades",
            solutions_col1, C_PRIMARY, 16, 12.5)

create_card(s4, Inches(6.9), Inches(1.6), Inches(5.6), Inches(5.3),
            "✨ Diagnostics, UI & Offline Data",
            solutions_col2, C_ACCENT, 16, 12.5)

# ==============================================================================
# SLIDE 5: Core Biomechanics & Smart Tolerance
# ==============================================================================
s5 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s5)
add_header(s5, "Mathematical Formulations & Smart Kinematic Tolerance")

create_card(s5, Inches(0.8), Inches(1.6), Inches(5.6), Inches(2.55),
            "📐 1. Vector Joint Angle Formulation",
            ["Calculates 2D joint angle θ at vertex B formed by limbs BA and BC:",
             "θ = arccos( (u • v) / (||u|| * ||v||) )",
             "where u = A - B and v = C - B; evaluated directly in degrees.",
             "Monitors elbow extension, knee flexion, hip abduction, and shoulder alignment."],
            C_PRIMARY)

create_card(s5, Inches(6.9), Inches(1.6), Inches(5.6), Inches(2.55),
            "🌊 2. EMA Keypoint Jitter Smoothing",
            ["Eliminates high-frequency webcam sensor jitter via Exponential Moving Average:",
             "S(t) = α * Y(t) + (1 - α) * S(t-1)   where α = 0.65",
             "Yields stable skeleton positions without perceptible lag.",
             "Prevents false angle fluctuation during stationary balance holding."],
            C_ACCENT)

create_card(s5, Inches(0.8), Inches(4.35), Inches(5.6), Inches(2.55),
            "⚖️ 3. Center-of-Gravity (CoG) Spatial Variance",
            ["Measures micro-movements across a rolling 15-frame window:",
             "σ² = (1/N) * Σ ||CoG(i) - mean(CoG)||²",
             "When user wobbles excessively, the posture hold timer pauses safely.",
             "Gated strictly: only operates when a user is actively performing the pose."],
            C_AMBER)

create_card(s5, Inches(6.9), Inches(4.35), Inches(5.6), Inches(2.55),
            "📏 4. Scale & Distance Invariance",
            ["Normalizes coordinate space relative to practitioner's physical torso size:",
             "Torso Length = ||Shoulders_Center - Hips_Center||",
             "Allows identical evaluation whether user is 1.5m or 3.5m away from webcam.",
             "Accommodates children, adults, and different body builds automatically."],
            C_PURPLE)

# ==============================================================================
# SLIDE 6: 7 Supported Asanas (Checkpoints & Benefits)
# ==============================================================================
s6 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s6)
add_header(s6, "7 Supported Classical Asanas & Biomechanical Targets")

col1_poses = [
    "Tree Pose (Vrikshasana): Hands joined in prayer/overhead (<65% torso); one straight leg (>130°) and one elevated foot. Strengthens balance.",
    "Chair Pose (Utkatasana): Bilateral knees flexed parallel between 75° and 145°; arms raised along ears. Builds quadriceps and core strength.",
    "Warrior Pose (Virabhadrasana): Lunge with front knee bent (65°-135°), rear leg extended (>135°); torso centered. Opens hips and chest.",
    "Downward Dog (Adho Mukha): Inverted 'V' shape; hips apex at highest point; arms and hamstrings extended. Calms nervous system."
]

col2_poses = [
    "Cobra Pose (Bhujangasana): Chest lifted >20° above hips; soft micro-bend in elbows to prevent spinal impingement. Decompresses lumbar discs.",
    "Shoulderstand (Sarvangasana): Full body inversion; hips and legs vertically stacked above shoulders. Stimulates thyroid and circulation.",
    "Triangle Pose (Trikonasana): Lateral spinal hinge; arms in 180° vertical vector; leading knee protected against lockout. Lengthens hamstrings."
]

create_card(s6, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.3),
            "🧘 Standing & Balance Poses",
            col1_poses, C_PRIMARY, 16, 12)

create_card(s6, Inches(6.9), Inches(1.6), Inches(5.6), Inches(5.3),
            "🧘 Floor, Prone & Inversion Poses",
            col2_poses, C_ACCENT, 16, 12)

# ==============================================================================
# SLIDE 7: Clean Studio UI & 10s Diagnostic Pop-Up
# ==============================================================================
s7 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s7)
add_header(s7, "Clean Studio UI & 10-Second Diagnostic Scorecard")

create_card(s7, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.3),
            "🧘 Ergonomic Studio UI Design",
            ["Responsive Studio Stage: Flexbox layout displays webcam feed (640x480) and target pose illustration side-by-side on all screens.",
             "HUD Overlays: Floating semi-transparent cards report real-time 'Pose Time: X.X s' and 'Best: X.X s' without obscuring the user.",
             "Continuous Anatomy: Green bones when aligned, Orange warnings on deviations, and Red alerts on hyperextension risks.",
             "Sub-15ms Latency: MoveNet Lightning runs locally at 30-60 FPS with zero video transmission outside the device."],
            C_PRIMARY, 16, 12.5)

create_card(s7, Inches(6.9), Inches(1.6), Inches(5.6), Inches(5.3),
            "⏱️ 10-Second Auto-Closing Modal",
            ["Hands-Free Auto-Dismiss: Closes automatically in 10s if untouched, returning practitioner to the selection menu without keyboard reach.",
             "Hover & Touch Hold: Touching the screen or hovering the mouse immediately pauses countdown to allow comfortable reading.",
             "Always-Scrollable: Modal body is scrollable with custom soft-tinted scrollbars, eliminating clipping on laptops and tablets.",
             "Auto-Save Guarantee: Comprehensive session metrics (stability, accuracy, hold time) auto-persist to IndexedDB even on auto-close."],
            C_AMBER, 16, 12.5)

# ==============================================================================
# SLIDE 8: Biomechanical Progress Dashboard (Dual Line & Bar Charts)
# ==============================================================================
s8 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s8)
add_header(s8, "IndexedDB Analytics & Dual Performance Charts (/progress)")

create_card(s8, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.3),
            "🗄️ 100% Offline Database",
            ["Uses browser IndexedDB ('YogaAIDB', store 'sessions').",
             "Zero cloud server subscriptions or ongoing data fees.",
             "Stores full workout telemetry locally on the client machine.",
             "Guarantees 100% biometric privacy: images and data never leave device."],
            C_PRIMARY)

create_card(s8, Inches(4.85), Inches(1.6), Inches(3.6), Inches(5.3),
            "📊 Always-Visible Dual Charts",
            ["Dual Performance Chart: Seamlessly renders dual Bar & Line SVG visualization.",
             "Line curve illustrates stability trajectory while bars display posture score.",
             "Always displays target baseline data even on brand-new installations.",
             "Styled with soft-tinted emerald-cyan scrollbars for smooth vertical scrolling."],
            C_ACCENT)

create_card(s8, Inches(8.9), Inches(1.6), Inches(3.6), Inches(5.3),
            "📥 One-Click JSON Export",
            ["Judges and doctors can click 'Export JSON Report 📥'.",
             "Exports full chronological workout history as structured JSON.",
             "Enables clinical audits, physical therapy tracking, and competition reviews.",
             "Clear History button allows live reset between judge demonstrations."],
            C_PURPLE)

# ==============================================================================
# SLIDE 9: District Judge FAQ & Defenses
# ==============================================================================
s9 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s9)
add_header(s9, "District Competition: Key Judge Defenses & FAQ")

create_card(s9, Inches(0.8), Inches(1.6), Inches(5.6), Inches(2.55),
            "Q: How do you prevent posture cheating?",
            ["Dual-Engine Verification: Deep learning neural network probability (>0.70) is cross-checked with strict geometric constraints.",
             "Hands must be joined in prayer/overhead (<65% torso); standing leg straight (>130°) and folded foot elevated off floor.",
             "Incorrect attempts are strictly rejected from accumulating hold time."],
            C_PRIMARY)

create_card(s9, Inches(6.9), Inches(1.6), Inches(5.6), Inches(2.55),
            "Q: Why client-side MoveNet over Cloud APIs?",
            ["Sub-15ms latency (30-60 FPS) provides instantaneous auditory and visual biofeedback.",
             "100% privacy: no webcam video or biometric coordinates ever travel over the internet.",
             "Operates with zero internet connectivity in rural schools or exhibition centers."],
            C_ACCENT)

create_card(s9, Inches(0.8), Inches(4.35), Inches(5.6), Inches(2.55),
            "Q: How does the AI protect joints from injury?",
            ["Models physiological range-of-motion limits for hinge joints (knees and elbows).",
             "Detects hyperextension (>177°) and alerts the practitioner with pulsing red joints.",
             "Offline voice coach instructs users to soften joints and maintain micro-bends."],
            C_RED)

create_card(s9, Inches(6.9), Inches(4.35), Inches(5.6), Inches(2.55),
            "Q: How does this compare to commercial fitness apps?",
            ["100% free and open-source ($0 vs $30-$80/month for Apple Fitness or Peloton).",
             "No specialized depth cameras or wearable sensors needed; works with standard webcams.",
             "True biomechanical clinical accuracy rather than superficial movement gamification."],
            C_PURPLE)

# ==============================================================================
# SLIDE 10: Conclusion & Winning 3-Step Live Demo
# ==============================================================================
s10 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s10)

tb_c = s10.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(1.5))
tfc = tb_c.text_frame
p = tfc.paragraphs[0]
p.text = "Thank You! Ready for Live Exhibition Demonstration 🧘‍♂️"
p.font.size = Pt(32)
p.font.bold = True
p.font.color.rgb = C_PRIMARY

p2 = tfc.add_paragraph()
p2.text = "Live Production URL: http://localhost:3000  •  Click to Open Live Studio"
p2.font.size = Pt(17)
p2.font.bold = True
p2.font.color.rgb = C_ACCENT
p2.space_before = Pt(6)

box_demo = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.5), Inches(11.7), Inches(4.6))
box_demo.fill.solid()
box_demo.fill.fore_color.rgb = C_CARD_BG
box_demo.line.color.rgb = C_ACCENT
box_demo.line.width = Pt(1.5)

tfd = box_demo.text_frame
pd1 = tfd.paragraphs[0]
pd1.text = "Winning 3-Step Live Demonstration Protocol for Judges:"
pd1.font.size = Pt(17)
pd1.font.bold = True
pd1.font.color.rgb = C_WHITE
pd1.space_after = Pt(8)

pd2 = tfd.add_paragraph()
pd2.text = "Step 1: Anti-Cheat & True Pose Verification Demo"
pd2.font.size = Pt(14)
pd2.font.bold = True
pd2.font.color.rgb = C_PRIMARY
pd2_sub = tfd.add_paragraph()
pd2_sub.text = "   • Select Tree Pose. Deliberately keep hands apart or kick leg backward → demonstrate that the AI strictly rejects the pose.\n   • Join hands and lift foot into proper form → skeleton illuminates emerald green, hold timer begins accumulating."
pd2_sub.font.size = Pt(12)
pd2_sub.font.color.rgb = C_MUTED
pd2_sub.space_after = Pt(6)

pd3 = tfd.add_paragraph()
pd3.text = "Step 2: 10-Second Auto-Closing Modal & Soft Scrollability Demo"
pd3.font.size = Pt(14)
pd3.font.bold = True
pd3.font.color.rgb = C_ACCENT
pd3_sub = tfd.add_paragraph()
pd3_sub.text = "   • Click 'Stop Pose'. Observe the 10-second countdown bar. Hover mouse over the card to pause countdown, scroll smoothly with soft-tinted scrollbars, or let it close hands-free."
pd3_sub.font.size = Pt(12)
pd3_sub.font.color.rgb = C_MUTED
pd3_sub.space_after = Pt(6)

pd4 = tfd.add_paragraph()
pd4.text = "Step 3: Biomechanical Analytics & JSON Export Demo"
pd4.font.size = Pt(14)
pd4.font.bold = True
pd4.font.color.rgb = C_PURPLE
pd4_sub = tfd.add_paragraph()
pd4_sub.text = "   • Navigate to /progress. Inspect the dual SVG performance chart showing stability trajectory and posture scores. Click 'Export JSON Report 📥' to download raw clinical audit data."
pd4_sub.font.size = Pt(12)
pd4_sub.font.color.rgb = C_MUTED

output_path = os.path.join(os.getcwd(), "Yoga_AI_Presentation.pptx")
prs.save(output_path)
print(f"SUCCESS: Saved strictly {len(prs.slides)}-slide presentation to {output_path}")


