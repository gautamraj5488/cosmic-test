import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInAnonymously, 
    onAuthStateChanged,
    signInWithCustomToken
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    doc, 
    setDoc, 
    addDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";

import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL,
    deleteObject
} from "firebase/storage";

// --- Firebase Initialization ---
const firebaseConfig = typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : {
        apiKey: "AIzaSyDPb4b-lRYgzu4cmqPVkFc24tG4APJaShU",
        authDomain: "test-portal-191d1.firebaseapp.com",
        projectId: "test-portal-191d1",
        storageBucket: "test-portal-191d1.firebasestorage.app",
        messagingSenderId: "940309149861",
        appId: "1:940309149861:web:56b29164cf8127740b354c"
      };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// --- Hardcoded User Credentials ---
const predefinedUsers = {
    "admin@quiz.com": { password: "pass1234", role: "admin" },
    "sandarbh@cosmic.com": { password: "pass1234", role: "user" },
    "gaurav@cosmic.com": { password: "pass1234", role: "user" }
};

// --- ICONS (as SVG components) ---
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconBarChart = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>;
const IconFileText = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IconUpload = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IconLogOut = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconSparkles = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
const IconEye = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconPlayCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>;

// --- UI & HELPER COMPONENTS ---

const LoadingScreen = () => (
    <div style={styles.centeredPageLayout}>
        <IconSparkles style={{height: '64px', width: '64px', color: '#60a5fa'}}/>
        <h1 style={{...styles.h1, marginTop: '16px'}}>Initializing Cosmic Quiz...</h1>
        <p style={{color: 'rgba(255,255,255,0.6)'}}>Please wait a moment.</p>
    </div>
);

const Modal = ({ show, onClose, children, title }) => {
    if (!show) return null;
    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>{title}</h3>
                    <button onClick={onClose} style={styles.modalCloseButton}><IconX /></button>
                </div>
                <div style={styles.modalBody}>{children}</div>
            </div>
        </div>
    );
};

const Timer = ({ endTime, onTimeUp }) => {
    const calculateTimeLeft = () => Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp, endTime]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isUrgent = minutes < 5;
    return (
        <div style={{...styles.timer, color: isUrgent ? '#ef4444' : 'rgba(255,255,255,0.8)'}}>
            <IconClock style={{width: '24px', height: '24px'}}/>
            <span style={{marginLeft: '8px', fontFamily: 'monospace', letterSpacing: '0.05em'}}>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
    );
};

const Header = ({ title, user, handleLogout }) => (
    <header style={styles.header}>
        <div>
            <h1 style={styles.h1}>{title}</h1>
            {user && <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginTop: '4px'}}>Logged in as: {user.email} ({user.role})</p>}
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
            <IconLogOut /> Logout
        </button>
    </header>
);

// --- CORE COMPONENTS ---

const LoginPage = ({ setUser, setCurrentPage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // --- inside LoginPage component ---
    const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    const userData = predefinedUsers[normalizedEmail];

    if (userData && userData.password === password) {
        const realUid = auth.currentUser?.uid;
        if (!realUid) {
        setError("Authentication not ready. Please try again in a moment.");
        return;
        }

        const loggedInUser = {
        email: normalizedEmail,      // store normalized email
        userKey: normalizedEmail,    // stable cross-device identifier
        uid: realUid,                // still keep Firebase uid if needed
        role: userData.role
        };

        localStorage.setItem('quizUser', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setCurrentPage(loggedInUser.role === 'admin' ? 'adminDashboard' : 'userDashboard');
    } else {
        setError('Invalid email or password.');
    }
    };


    return (
        <div style={styles.centeredPageLayout}>
            <div style={styles.loginCard}>
                <div style={{textAlign: 'center', marginBottom: '32px'}}>
                    <IconSparkles style={{margin: '0 auto', height: '48px', width: '48px', color: 'white'}}/>
                    <h1 style={{...styles.h1, marginTop: '16px', fontSize: '36px'}}>Cosmic Quiz</h1>
                    <p style={{color: 'rgba(255,255,255,0.7)'}}>Sign in to begin your exploration</p>
                </div>
                <form onSubmit={handleLogin}>
                    <div style={{marginBottom: '16px'}}>
                        <input type="email" style={styles.inputField} placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div style={{marginBottom: '24px'}}>
                        <input type="password" style={styles.inputField} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {error && <p style={{color: '#ef4444', fontSize: '14px', textAlign: 'center', marginBottom: '16px'}}>{error}</p>}
                    <button type="submit" style={styles.primaryButton}>Launch</button>
                </form>
                <div style={{marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5'}}>
                    {/* <p><span style={{fontWeight: 'bold', color: 'rgba(255,255,255,0.7)'}}>Admin:</span> admin@quiz.com / pass1234</p> */}
                    {/* <p><span style={{fontWeight: 'bold', color: 'rgba(255,255,255,0.7)'}}>User:</span> user@quiz.com / pass1234</p> */}
                </div>
            </div>
        </div>
    );
};


const AdminDashboard = ({ tests, setCurrentPage, setSelectedTest, user, handleLogout }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [testToDeleteId, setTestToDeleteId] = useState(null);

    const handleDeleteClick = (id) => {
        setTestToDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (testToDeleteId) await deleteDoc(doc(db, "tests", testToDeleteId));
        setShowDeleteModal(false);
        setTestToDeleteId(null);
    };

    return (
        <div style={styles.dashboardLayout}>
            <Header title="Admin Dashboard" user={user} handleLogout={handleLogout} />
            <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '24px'}}>
                 <button onClick={() => { setSelectedTest(null); setCurrentPage('testCreator'); }} style={styles.primaryButton}>
                    <IconPlus /> Create New Test
                </button>
            </div>
            <div style={styles.card}>
                <h2 style={{...styles.h2, marginBottom: '24px'}}>Available Tests</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {tests.map(test => (
                        <div key={test.id} style={styles.listItem}>
                            <div>
                                <h3 style={styles.listItemTitle}>{test.name}</h3>
                                <p style={styles.listItemSubtitle}>{test.questions.length} Questions | {test.duration} Minutes</p>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <button onClick={() => { setSelectedTest(test); setCurrentPage('analytics'); }} style={styles.iconButton} title="View Analytics"><IconBarChart /></button>
                                <button onClick={() => { setSelectedTest(test); setCurrentPage('testCreator'); }} style={styles.iconButton} title="Edit Test"><IconEdit /></button>
                                <button onClick={() => handleDeleteClick(test.id)} style={{...styles.iconButton, color: '#ef4444'}} title="Delete Test"><IconTrash /></button>
                            </div>
                        </div>
                    ))}
                    {tests.length === 0 && <p style={styles.noDataText}>No tests created yet. Click "Create New Test" to get started!</p>}
                </div>
            </div>
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Deletion">
                <p style={{color: '#cbd5e1'}}>Are you sure you want to delete this test? This action is permanent and cannot be undone.</p>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px'}}>
                    <button onClick={() => setShowDeleteModal(false)} style={styles.secondaryButton}>Cancel</button>
                    <button onClick={confirmDelete} style={{...styles.primaryButton, backgroundColor: '#dc2626'}}>Delete Test</button>
                </div>
            </Modal>
        </div>
    );
};

// --- HELPER FUNCTION (can go above TestCreator) ---

/**
 * Uploads a file to Firebase Storage
 * @param {File} file - The file to upload
 * @returns {Promise<{downloadURL: string, path: string}>}
 */
const uploadFileToStorage = async (file) => {
    if (!file) throw new Error("No file provided");
    
    // Create a unique file path
    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the public URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return { downloadURL, path: storageRef.fullPath };
};

// --- CORE COMPONENTS (Replace your old TestCreator) ---

const TestCreator = ({ selectedTest, setCurrentPage, user, handleLogout }) => {
    const [test, setTest] = useState({ name: '', duration: 30, questions: [] });
    const [isUploading, setIsUploading] = useState(false); // <-- New state
    const fileInputRefs = useRef({});

    useEffect(() => {
        if (selectedTest) {
            setTest(JSON.parse(JSON.stringify(selectedTest)));
        } else {
            setTest({ name: '', duration: 60, questions: [{ id: Date.now(), type: 'MCQ', text: '', image: null, imagePath: null, correctAnswer: '', options: [{text:'', image: null, imagePath: null}, {text:'', image: null, imagePath: null}, {text:'', image: null, imagePath: null}, {text:'', image: null, imagePath: null}] }] });
        }
    }, [selectedTest]);
    
    // --- Generic field change handler ---
    const handleQuestionChange = (qIndex, field, value) => {
        const newQuestions = [...test.questions];
        newQuestions[qIndex][field] = value;
        setTest({ ...test, questions: newQuestions });
    };

    // --- New File Upload Handlers ---

    const handleQuestionImageChange = async (qIndex, file) => {
        if (!file) return;
        setIsUploading(true);
        
        // 1. Delete old image if it exists
        const oldPath = test.questions[qIndex].imagePath;
        if (oldPath) {
            try { await deleteObject(ref(storage, oldPath)); } catch (e) { console.warn("Old image delete failed", e); }
        }
        
        // 2. Upload new image
        try {
            const { downloadURL, path } = await uploadFileToStorage(file);
            const newQuestions = [...test.questions];
            newQuestions[qIndex].image = downloadURL;
            newQuestions[qIndex].imagePath = path;
            setTest({ ...test, questions: newQuestions });
        } catch (error) {
            console.error("Upload failed", error);
            alert("Image upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleOptionChange = (qIndex, oIndex, field, value) => {
        const newQuestions = [...test.questions];
        newQuestions[qIndex].options[oIndex][field] = value;
        setTest({ ...test, questions: newQuestions });
    };

    const handleOptionImageChange = async (qIndex, oIndex, file) => {
         if (!file) return;
        setIsUploading(true);
        
        // 1. Delete old image if it exists
        const oldPath = test.questions[qIndex].options[oIndex].imagePath;
        if (oldPath) {
            try { await deleteObject(ref(storage, oldPath)); } catch (e) { console.warn("Old image delete failed", e); }
        }
        
        // 2. Upload new image
        try {
            const { downloadURL, path } = await uploadFileToStorage(file);
            const newQuestions = [...test.questions];
            newQuestions[qIndex].options[oIndex].image = downloadURL;
            newQuestions[qIndex].options[oIndex].imagePath = path;
            setTest({ ...test, questions: newQuestions });
        } catch (error) {
            console.error("Upload failed", error);
            alert("Image upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };
    
    // --- New Image Removal Handlers ---
    
    const handleRemoveQuestionImage = async (qIndex) => {
        setIsUploading(true);
        const oldPath = test.questions[qIndex].imagePath;
        if (oldPath) {
            try {
                await deleteObject(ref(storage, oldPath));
                const newQuestions = [...test.questions];
                newQuestions[qIndex].image = null;
                newQuestions[qIndex].imagePath = null;
                setTest({ ...test, questions: newQuestions });
            } catch (e) { console.warn("Image delete failed", e); }
        }
        setIsUploading(false);
    };
    
    const handleRemoveOptionImage = async (qIndex, oIndex) => {
        setIsUploading(true);
        const oldPath = test.questions[qIndex].options[oIndex].imagePath;
        if (oldPath) {
            try {
                await deleteObject(ref(storage, oldPath));
                const newQuestions = [...test.questions];
                newQuestions[qIndex].options[oIndex].image = null;
                newQuestions[qIndex].options[oIndex].imagePath = null;
                setTest({ ...test, questions: newQuestions });
            } catch (e) { console.warn("Image delete failed", e); }
        }
        setIsUploading(false);
    };

    // --- Other handlers (no change) ---
    const handleCorrectAnswerChange = (qIndex, value, isMSQ = false) => {
        // ... (no changes needed here) ...
        const newQuestions = [...test.questions];
        if (isMSQ) {
            const currentAnswers = newQuestions[qIndex].correctAnswer || [];
            const newAnswers = currentAnswers.includes(value) ? currentAnswers.filter(a => a !== value) : [...currentAnswers, value];
            newQuestions[qIndex].correctAnswer = newAnswers;
        } else {
            newQuestions[qIndex].correctAnswer = value;
        }
        setTest({ ...test, questions: newQuestions });
    };

    const addQuestion = (type) => {
        const newQuestion = { id: Date.now(), type, text: '', image: null, imagePath: null, correctAnswer: type === 'MSQ' ? [] : '' };
        if (type === 'MCQ' || type === 'MSQ') newQuestion.options = [{text:'', image: null, imagePath: null}, {text:'', image: null, imagePath: null}];
        setTest({ ...test, questions: [...test.questions, newQuestion] });
    };

    const addOption = (qIndex) => {
        const newQuestions = [...test.questions];
        newQuestions[qIndex].options.push({text:'', image: null, imagePath: null});
        setTest({ ...test, questions: newQuestions });
    };
    
    const removeOption = (qIndex, oIndex) => {
        // Note: This doesn't delete the image from storage.
        // For simplicity, we assume removing an option is rare.
        // A robust solution would delete it here.
        const newQuestions = [...test.questions];
        newQuestions[qIndex].options.splice(oIndex, 1);
        setTest({ ...test, questions: newQuestions });
    };

    const removeQuestion = (qIndex) => {
        // Note: This also doesn't delete images.
        // This requires looping the question and all its options to delete from storage.
        // This is a good candidate for a Firebase Cloud Function on document delete.
        const newQuestions = test.questions.filter((_, index) => index !== qIndex);
        setTest({ ...test, questions: newQuestions });
    };

    const saveTest = async () => {
        if (isUploading) return alert("Please wait for images to finish uploading.");
        if (test.name.trim() === '') return alert('Please provide a name for the test.');
        
        // The 'test' object now contains URLs and paths, not base64
        if (selectedTest) await setDoc(doc(db, "tests", selectedTest.id), test, { merge: true });
        else await addDoc(collection(db, "tests"), test);
        
        setCurrentPage('adminDashboard');
    };

    // --- Render Function ---
    const renderQuestionForm = (q, qIndex) => (
      <div key={q.id} style={styles.questionFormCard}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
          }}
        >
          <span
            style={{ fontWeight: "bold", fontSize: "18px", color: "white" }}
          >
            Question {qIndex + 1}{" "}
            <span
              style={{
                fontWeight: "normal",
                fontSize: "14px",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              ({q.type})
            </span>
          </span>
          <button
            onClick={() => removeQuestion(qIndex)}
            style={{ ...styles.iconButton, color: "#ef4444" }}
            disabled={isUploading}
          >
            <IconTrash />
          </button>
        </div>
        <textarea
          style={styles.inputField}
          placeholder="Question Text..."
          value={q.text}
          onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
        />
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={(el) => (fileInputRefs.current[`q_${qIndex}`] = el)}
            onChange={(e) =>
              handleQuestionImageChange(qIndex, e.target.files[0])
            }
          />
          <button
            onClick={() => fileInputRefs.current[`q_${qIndex}`]?.click()}
            style={styles.uploadButton}
            disabled={isUploading}
          >
            <IconUpload /> {q.image ? "Change Image" : "Upload Image"}
          </button>
          {q.image && (
            <div style={{ position: "relative" }}>
              <img
                src={q.image}
                alt="Question"
                style={{
                  height: "64px",
                  width: "auto",
                  borderRadius: "4px",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              <button
                onClick={() => handleRemoveQuestionImage(qIndex)}
                style={styles.removeImageButton}
                disabled={isUploading}
              >
                <IconX />
              </button>
            </div>
          )}
        </div>
        <div style={{ marginTop: "24px" }}>
          <h4
            style={{
              fontWeight: "600",
              fontSize: "16px",
              color: "rgba(255,255,255,0.8)",
              marginBottom: "12px",
            }}
          >
            Options & Answer
          </h4>
          {(q.type === "INTEGER" || q.type === "SHORT_ANSWER") && (
            <input
              type={q.type === "INTEGER" ? "number" : "text"}
              style={styles.inputField}
              placeholder="Correct Answer"
              value={q.correctAnswer}
              onChange={(e) =>
                handleCorrectAnswerChange(qIndex, e.target.value)
              }
            />
          )}
          {(q.type === "MCQ" || q.type === "MSQ") &&
            q.options.map((opt, oIndex) => (
              <div key={oIndex} style={styles.optionItem}>
                {/* <input type={q.type === 'MCQ' ? 'radio' : 'checkbox'} name={`correct_answer_${qIndex}`} checked={q.type === 'MCQ' ? q.correctAnswer === opt.text : (q.correctAnswer || []).includes(opt.text)} onChange={() => handleCorrectAnswerChange(qIndex, opt.text, q.type === 'MSQ')} /> */}
                <input
                  type={q.type === "MCQ" ? "radio" : "checkbox"}
                  // Fix 1: Give checkboxes unique names, but keep radio names grouped
                  name={
                    q.type === "MCQ"
                      ? `correct_answer_${qIndex}`
                      : `correct_answer_${qIndex}_${oIndex}`
                  }
                  checked={
                    q.type === "MCQ"
                      ? q.correctAnswer === opt.text
                      : (q.correctAnswer || []).includes(opt.text)
                  }
                  onChange={() =>
                    handleCorrectAnswerChange(
                      qIndex,
                      opt.text,
                      q.type === "MSQ"
                    )
                  }
                  // Fix 2 (The Bug Fix): Disable input if option text is empty
                  disabled={opt.text.trim() === ""}
                  title={
                    opt.text.trim() === ""
                      ? "Please enter text for this option before marking it as correct."
                      : "Mark as correct answer"
                  }
                />
                <input
                  type="text"
                  style={styles.inputField}
                  placeholder={`Option ${oIndex + 1}`}
                  value={opt.text}
                  onChange={(e) =>
                    handleOptionChange(qIndex, oIndex, "text", e.target.value)
                  }
                />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={(el) =>
                    (fileInputRefs.current[`q_${qIndex}_o_${oIndex}`] = el)
                  }
                  onChange={(e) =>
                    handleOptionImageChange(qIndex, oIndex, e.target.files[0])
                  }
                />
                <button
                  onClick={() =>
                    fileInputRefs.current[`q_${qIndex}_o_${oIndex}`]?.click()
                  }
                  style={styles.uploadButtonSmall}
                  disabled={isUploading}
                >
                  <IconUpload />
                </button>
                {opt.image && (
                  <div style={{ position: "relative" }}>
                    <img
                      src={opt.image}
                      alt="Option"
                      style={{
                        height: "40px",
                        width: "auto",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      onClick={() => handleRemoveOptionImage(qIndex, oIndex)}
                      style={styles.removeImageButtonSmall}
                      disabled={isUploading}
                    >
                      <IconX />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => removeOption(qIndex, oIndex)}
                  style={{
                    ...styles.iconButton,
                    color: "rgba(255,255,255,0.6)",
                  }}
                  disabled={isUploading}
                >
                  <IconTrash />
                </button>
              </div>
            ))}
          {(q.type === "MCQ" || q.type === "MSQ") && (
            <button
              onClick={() => addOption(qIndex)}
              style={styles.addOptionButton}
              disabled={isUploading}
            >
              + Add Option
            </button>
          )}
        </div>
      </div>
    );

    return (
        <div style={styles.dashboardLayout}>
            <Header title={selectedTest ? 'Edit Test' : 'Create New Test'} user={user} handleLogout={handleLogout} />
            <div style={styles.card}>
                <div style={styles.formGrid}>
                    <input type="text" style={styles.inputField} placeholder="Test Name" value={test.name} onChange={(e) => setTest({ ...test, name: e.target.value })} />
                    <input type="number" style={styles.inputField} placeholder="Duration (minutes)" value={test.duration} onChange={(e) => setTest({ ...test, duration: parseInt(e.target.value) || 0 })} />
                </div>
                <div>{test.questions.map(renderQuestionForm)}</div>
                <div style={{display: 'flex', gap: '16px', margin: '32px 0', flexWrap: 'wrap'}}>
                    <button onClick={() => addQuestion('MCQ')} style={styles.secondaryButton} disabled={isUploading}>Add MCQ</button>
                    <button onClick={() => addQuestion('MSQ')} style={styles.secondaryButton} disabled={isUploading}>Add Multiple Correct</button>
                    <button onClick={() => addQuestion('INTEGER')} style={styles.secondaryButton} disabled={isUploading}>Add Integer</button>
                    <button onClick={() => addQuestion('SHORT_ANSWER')} style={styles.secondaryButton} disabled={isUploading}>Add Short Answer</button>
                </div>
                <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '24px'}}>
                     {isUploading && <span style={{color: 'rgba(255,255,255,0.7)', fontSize: '14px'}}>Uploading image...</span>}
                     <button onClick={() => setCurrentPage('adminDashboard')} style={styles.secondaryButton} disabled={isUploading}>Cancel</button>
                     <button onClick={saveTest} style={styles.primaryButton} disabled={isUploading}>Save Test</button>
                </div>
            </div>
        </div>
    );
};
const UserDashboard = ({ tests, user, submissions, setCurrentPage, setSelectedTest, handleStartTest, setLastSubmission, handleLogout }) => (
    <div style={styles.dashboardLayout}>
        <Header title="Welcome, Explorer!" user={user} handleLogout={handleLogout} />
        <div style={styles.card}>
            <h2 style={{...styles.h2, marginBottom: '24px'}}>Available Tests</h2>
             <div style={styles.gridContainer}>
                {tests.map(test => {
                    // inside UserDashboard tests.map(...)
const userSubmission = submissions.find(
  s => s.testId === test.id && s.userId === user.userKey
);

                    const isCompleted = userSubmission?.status === 'completed';
                    const isInProgress = userSubmission?.status === 'in-progress';
                    
                    return (
                        <div key={test.id} style={styles.dashboardCard}>
                            <div>
                                <h3 style={styles.dashboardCardTitle}>{test.name}</h3>
                                <div style={{display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '4px'}}><IconFileText /> <span style={{marginLeft: '8px'}}>{test.questions.length} Questions</span></div>
                                <div style={{display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '14px'}}><IconClock style={{width: '20px', height: '20px'}}/> <span style={{marginLeft: '8px'}}>{test.duration} Minutes</span></div>
                            </div>
                            {isCompleted ? (
                                <button onClick={() => { setLastSubmission(userSubmission); setSelectedTest(test); setCurrentPage('results'); }} style={styles.dashboardCardButtonGreen}>View Results</button>
                            ) : isInProgress ? (
                                <button onClick={() => handleStartTest(test, true)} style={{...styles.dashboardCardButtonBlue, backgroundColor: '#f59e0b'}}>
                                    <IconPlayCircle /> Resume Test
                                </button>
                            ) : (
                                <button onClick={() => handleStartTest(test)} style={styles.dashboardCardButtonBlue}>Start Test</button>
                            )}
                        </div>
                    )
                })}
                 {tests.length === 0 && <p style={{...styles.noDataText, gridColumn: '1 / -1'}}>No tests are available at the moment.</p>}
            </div>
        </div>
    </div>
);

const TestTaker = ({ test, currentSubmission, submitTest, setCurrentPage }) => {
    if (!test || !currentSubmission) {
        return <LoadingScreen />;
    }

    const [answers, setAnswers] = useState(currentSubmission.answers || {});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const handleAnswerChange = async (qId, answer, type) => {
        const newAnswers = { ...answers };
        if (type === 'MSQ') {
            const current = newAnswers[qId] || [];
            newAnswers[qId] = current.includes(answer) ? current.filter(a => a !== answer) : [...current, answer];
        } else {
            newAnswers[qId] = answer;
        }
        setAnswers(newAnswers);

        const submissionRef = doc(db, "submissions", currentSubmission.id);
        await updateDoc(submissionRef, { answers: newAnswers });
    };
    
    const handleConfirmSubmit = async () => {
        await submitTest(test.id, answers, currentSubmission.id);
        setShowSubmitModal(false);
    };
    
    if (test.questions.length === 0) {
        return (
            <div style={styles.centeredPageLayout}>
                <p>This test has no questions.</p>
                <button onClick={() => setCurrentPage('userDashboard')} style={{...styles.secondaryButton, marginTop: '16px'}}>Back to Dashboard</button>
            </div>
        );
    }
    
    const currentQuestion = test.questions[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / test.questions.length) * 100;
    
    return (
        <div style={styles.testTakerLayout}>
            <header style={styles.testTakerHeader}>
                <h1 style={{...styles.h1, fontSize: '24px'}}>{test.name}</h1>
                {currentSubmission?.endTime?.toMillis && (
                    <Timer endTime={currentSubmission.endTime.toMillis()} onTimeUp={handleConfirmSubmit} />
                )}
            </header>
            <main style={styles.testTakerMain}>
                <div style={styles.card}>
                    <div style={{marginBottom: '24px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px'}}>
                             <h2 style={{fontSize: '20px', fontWeight: '600', color: 'rgba(255,255,255,0.8)'}}>Question {currentQuestionIndex + 1} of {test.questions.length}</h2>
                             <span style={{fontSize: '14px', fontWeight: '500', color: '#60a5fa'}}>{Math.round(progressPercentage)}%</span>
                        </div>
                        <div style={{width: '100%', backgroundColor: '#475569', borderRadius: '9999px', height: '10px'}}>
                            <div style={{backgroundColor: '#60a5fa', height: '10px', borderRadius: '9999px', width: `${progressPercentage}%`, transition: 'width 0.3s ease-in-out'}}></div>
                        </div>
                    </div>

                    <p style={{fontSize: '18px', color: 'white', marginBottom: '16px'}}>{currentQuestion.text}</p>
                    {currentQuestion.image && <img src={currentQuestion.image} alt="Question visual aid" style={{margin: '16px 0', borderRadius: '8px', maxWidth: '100%', height: 'auto', border: '1px solid rgba(255,255,255,0.2)'}} />}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px'}}>
                        {(currentQuestion.type === 'INTEGER' || currentQuestion.type === 'SHORT_ANSWER') && (
                            <input
                                type={currentQuestion.type === 'INTEGER' ? 'number' : 'text'}
                                style={styles.inputField}
                                placeholder="Your answer..."
                                value={answers[currentQuestion.id] || ''}
                                onChange={e => handleAnswerChange(currentQuestion.id, e.target.value, currentQuestion.type)}
                            />
                        )}
                        {(currentQuestion.type === 'MCQ' || currentQuestion.type === 'MSQ') && currentQuestion.options.map((opt, oIndex) => (
                            <label key={oIndex} style={{...styles.optionLabel, backgroundColor: (answers[currentQuestion.id] || []).includes(opt.text) || answers[currentQuestion.id] === opt.text ? 'rgba(96, 165, 250, 0.3)' : 'inherit', borderColor: (answers[currentQuestion.id] || []).includes(opt.text) || answers[currentQuestion.id] === opt.text ? '#60a5fa' : 'rgba(255,255,255,0.2)'}}>
                                <input type={currentQuestion.type === 'MCQ' ? 'radio' : 'checkbox'} name={`question_${currentQuestion.id}`} checked={ currentQuestion.type === 'MCQ' ? answers[currentQuestion.id] === opt.text : (answers[currentQuestion.id] || []).includes(opt.text) } onChange={() => handleAnswerChange(currentQuestion.id, opt.text, currentQuestion.type)} />
                                <div style={{flexGrow: 1}}>
                                    <span style={{color: 'rgba(255,255,255,0.9)'}}>{opt.text}</span>
                                    {opt.image && <img src={opt.image} alt="Option visual aid" style={{marginTop: '12px', borderRadius: '8px', maxWidth: '160px', height: 'auto', border: '1px solid rgba(255,255,255,0.2)'}}/>}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </main>
            <footer style={styles.testTakerFooter}>
                <button onClick={() => setCurrentQuestionIndex(prev => prev - 1)} disabled={currentQuestionIndex === 0} style={{...styles.secondaryButton, opacity: currentQuestionIndex === 0 ? 0.5 : 1}}>Previous</button>
                <span style={{color: 'rgba(255,255,255,0.7)', fontWeight: '600'}}>{currentQuestionIndex + 1} / {test.questions.length}</span>
                {currentQuestionIndex === test.questions.length - 1 ? (
                    <button onClick={() => setShowSubmitModal(true)} style={styles.dashboardCardButtonGreen}>Submit Test</button>
                ) : (
                    <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} style={styles.primaryButton}>Next</button>
                )}
            </footer>
            <Modal show={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Confirm Submission">
                <p style={{color: '#cbd5e1'}}>Are you sure you want to submit your test?</p>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px'}}>
                    <button onClick={() => setShowSubmitModal(false)} style={styles.secondaryButton}>Cancel</button>
                    <button onClick={handleConfirmSubmit} style={{...styles.primaryButton, backgroundColor: '#16a34a'}}>Submit</button>
                </div>
            </Modal>
        </div>
    );
};

const ScoreCircle = ({ score, total }) => {
    const percentage = total > 0 ? (score / total) * 100 : 0;
    const circumference = 2 * Math.PI * 50;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    let color = '#ef4444';
    if (percentage >= 75) color = '#4ade80';
    else if (percentage >= 40) color = '#facc15';

    return (
        <div style={{position: 'relative', width: '192px', height: '192px'}}>
            <svg style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}} viewBox="0 0 120 120">
                <circle style={{color: 'rgba(255,255,255,0.1)'}} strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="60" cy="60" />
                <circle style={{color, transition: 'stroke-dashoffset 0.5s ease-out', strokeWidth: '10', strokeDasharray: circumference, strokeDashoffset, strokeLinecap: 'round', stroke: 'currentColor', fill: 'transparent'}} r="50" cx="60" cy="60" />
            </svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <span style={{fontSize: '36px', fontWeight: 'bold', color: 'white'}}>{score}</span>
                <span style={{fontSize: '18px', color: 'rgba(255,255,255,0.7)'}}>out of {total}</span>
            </div>
        </div>
    );
};

const SubmissionReview = ({ submission, test }) => {
    const renderAnswer = (answer) => {
        if (answer === undefined || answer === null || (Array.isArray(answer) && answer.length === 0)) return "Not Answered";
        if (Array.isArray(answer)) return answer.join(', ');
        return answer;
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            {test.questions.map((q, index) => {
                const userAnswer = submission.answers ? submission.answers[q.id] : undefined;
                let isCorrect = false;
                if (userAnswer !== undefined) {
                    if (q.type === 'MSQ') {
                        isCorrect = JSON.stringify([...(userAnswer || [])].sort()) === JSON.stringify([...q.correctAnswer].sort());
                    } else {
                        isCorrect = String(userAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
                    }
                }

                return (
                    <div key={q.id} style={{...styles.reviewCard, borderColor: isCorrect ? 'rgba(74, 222, 128, 0.5)' : 'rgba(239, 68, 68, 0.5)', backgroundColor: isCorrect ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)'}}>
                        <p style={{fontWeight: '600', color: 'white', marginBottom: '12px'}}>Question {index + 1}: {q.text}</p>
                        <div style={{fontSize: '14px', lineHeight: '1.5'}}>
                            <div style={{display: 'flex', alignItems: 'flex-start'}}>
                                <span style={{fontWeight: '600', marginRight: '8px', width: '112px', flexShrink: 0, color: isCorrect ? '#86efac' : '#fca5a5'}}>Student's Answer:</span>
                                <span style={{color: 'rgba(255,255,255,0.9)'}}>{renderAnswer(userAnswer)}</span>
                            </div>
                            {!isCorrect && (
                                <div style={{display: 'flex', alignItems: 'flex-start', marginTop: '4px'}}>
                                    <span style={{fontWeight: '600', marginRight: '8px', width: '112px', flexShrink: 0, color: '#60a5fa'}}>Correct Answer:</span>
                                    <span style={{color: 'rgba(255,255,255,0.9)'}}>{renderAnswer(q.correctAnswer)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const ResultsPage = ({ submission, test, setCurrentPage }) => {
    const [showReview, setShowReview] = useState(false);

    return (
        <div style={styles.centeredPageLayout}>
            <div style={{...styles.resultsCard, display: showReview ? 'none' : 'block' }}>
                 <h1 style={{...styles.h1, fontSize: '36px'}}>Test Complete!</h1>
                 <p style={{color: 'rgba(255,255,255,0.7)', marginTop: '8px', marginBottom: '32px'}}>Here are your results for the "{test.name}" test.</p>
                 <div style={{margin: '32px 0', display: 'flex', justifyContent: 'center'}}>
                     <ScoreCircle score={submission.score} total={submission.total} />
                 </div>
                 <div style={{display: 'flex', justifyContent: 'center', gap: '16px'}}>
                    <button onClick={() => setCurrentPage('userDashboard')} style={styles.secondaryButton}>Dashboard</button>
                    <button onClick={() => setShowReview(true)} style={styles.primaryButton}>
                        <IconEye /> Review Answers
                    </button>
                 </div>
            </div>
            
            {showReview && (
                 <div style={styles.dashboardLayout}>
                    <h1 style={{...styles.h1, fontSize: '30px', marginBottom: '8px'}}>Answer Review</h1>
                    <p style={{color: 'rgba(255,255,255,0.7)', marginBottom: '32px'}}>Results for the "{test.name}" test.</p>
                    <SubmissionReview submission={submission} test={test} />
                    <div style={{marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px'}}>
                        <button onClick={() => setShowReview(false)} style={styles.secondaryButton}>Back to Score</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const AnalyticsPage = ({ test, setCurrentPage }) => {
    const [testSubmissions, setTestSubmissions] = useState([]);
    const [viewingSubmission, setViewingSubmission] = useState(null);

    useEffect(() => {
        if (!test) return;
        const q = query(collection(db, "submissions"), where("testId", "==", test.id), where("status", "==", "completed"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTestSubmissions(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        });
        return () => unsubscribe();
    }, [test]);

    const averageScore = testSubmissions.reduce((acc, s) => acc + s.score, 0) / (testSubmissions.length || 1);
    
    const scoreDistribution = useMemo(() => {
        if (!test || test.questions.length === 0) return [];
        const distribution = Array(test.questions.length + 1).fill(0);
        testSubmissions.forEach(s => {
            if (s.score >= 0 && s.score <= test.questions.length) distribution[s.score]++;
        });
        return distribution;
    }, [testSubmissions, test]);

    const maxCount = Math.max(...scoreDistribution, 1);

    return (
        <div style={styles.dashboardLayout}>
             <button onClick={() => setCurrentPage('adminDashboard')} style={styles.backButton}>&larr; Back to Dashboard</button>
            <h1 style={{...styles.h1, marginBottom: '32px'}}>Analytics for "{test.name}"</h1>
            <div style={styles.analyticsGrid}>
                <div style={styles.analyticsStatCard}><h3 style={styles.analyticsStatTitle}>Total Submissions</h3><p style={styles.analyticsStatValueBlue}>{testSubmissions.length}</p></div>
                <div style={styles.analyticsStatCard}><h3 style={styles.analyticsStatTitle}>Average Score</h3><p style={styles.analyticsStatValueGreen}>{averageScore.toFixed(2)}</p></div>
                <div style={styles.analyticsStatCard}><h3 style={styles.analyticsStatTitle}>Total Questions</h3><p style={styles.analyticsStatValueWhite}>{test.questions.length}</p></div>
            </div>
             
            <div style={{...styles.card, marginBottom: '32px'}}>
                 <h2 style={{...styles.h2, marginBottom: '24px'}}>Score Distribution</h2>
                 {testSubmissions.length > 0 ? (
                    <div style={styles.barChartContainer}>
                        {scoreDistribution.map((count, score) => (
                            <div key={score} style={styles.barChartItem}>
                                <div style={{fontSize: '14px', fontWeight: 'bold', color: 'white', marginBottom: '4px'}}>{count}</div>
                                <div style={{width: '100%', backgroundColor: '#60a5fa', borderRadius: '4px 4px 0 0', height: `${(count / maxCount) * 100}%`, transition: 'all 0.3s ease'}}></div>
                                <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '8px'}}>{score}</div>
                            </div>
                        ))}
                    </div>
                 ) : ( <p style={styles.noDataText}>No submission data to display chart.</p> )}
            </div>

            <div style={styles.card}>
                <h2 style={{...styles.h2, marginBottom: '16px'}}>Submission Details</h2>
                <div style={{overflowX: 'auto'}}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>Student Email</th>
                                <th style={styles.tableHeader}>Score</th>
                                <th style={styles.tableHeader}>Date</th>
                                <th style={styles.tableHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testSubmissions.map((sub) => (
                            <tr key={sub.id}>
                                <td style={styles.tableCell}>{sub.userEmail}</td>
                                <td style={{...styles.tableCell, fontWeight: '600', color: 'white'}}>{sub.score} / {sub.total}</td>
                                <td style={{...styles.tableCell, color: 'rgba(255,255,255,0.6)'}}>{sub.submitTime?.toDate().toLocaleDateString() || "N/A"}</td>
                                <td style={styles.tableCell}>
                                    <button onClick={() => setViewingSubmission(sub)} style={styles.viewButton}>
                                        <IconEye /> View
                                    </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {testSubmissions.length === 0 && <p style={styles.noDataText}>No submissions recorded for this test yet.</p>}
            </div>
            
            <Modal show={!!viewingSubmission} onClose={() => setViewingSubmission(null)} title={`Review for ${viewingSubmission?.userEmail}`}>
                {viewingSubmission && <SubmissionReview submission={viewingSubmission} test={test} />}
            </Modal>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

export default function App() {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('quizUser');
        if (!raw) return null;
        try {
            const u = JSON.parse(raw);
            const normalizedEmail = (u.email || '').trim().toLowerCase();
            const withKey = { ...u, email: normalizedEmail, userKey: u.userKey || normalizedEmail };
            localStorage.setItem('quizUser', JSON.stringify(withKey));
            return withKey;
        } catch {
            return null;
        }
    });

    const [authReady, setAuthReady] = useState(false);
    const [currentPage, setCurrentPage] = useState('login');
    const [tests, setTests] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [lastSubmission, setLastSubmission] = useState(null);
    const [currentSubmission, setCurrentSubmission] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                 try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
                    else await signInAnonymously(auth);
                } catch (error) { console.error("Firebase Auth Error:", error); }
            }
            setAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if(!authReady) return;
        const unsubTests = onSnapshot(collection(db, "tests"), (snapshot) => {
            setTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubTests();
    }, [authReady]);
    
    useEffect(() => {
  if (!user || !authReady) { setSubmissions([]); return; }

  const qByEmail = query(
    collection(db, "submissions"),
    where("userId", "==", user.userKey)   // email as the primary key
  );

  const unsubSubmissions = onSnapshot(qByEmail, (snapshot) => {
    setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });

  return () => unsubSubmissions();
}, [user, authReady]);


    const handleLogout = () => {
        localStorage.removeItem('quizUser');
        setUser(null);
        setCurrentPage('login');
    };

const handleStartTest = async (test, isResuming = false) => {
  if (!user) return;

  let submission;
  if (isResuming) {
    // Resume existing in-progress submission by email key
    submission = submissions.find(
      s => s.testId === test.id && s.userId === user.userKey
    );
  } else {
    // Start a fresh submission tied to email key
    const endTime = new Date(Date.now() + test.duration * 60 * 1000);
    const newSubmission = {
      testId: test.id,
      userId: user.userKey,   // email key, not Firebase uid
      userEmail: user.email,  // for analytics display
      status: 'in-progress',
      startTime: serverTimestamp(),
      endTime,                // Firestore will store as Timestamp
      score: 0,
      total: test.questions.length,
      answers: {}
    };
    const docRef = await addDoc(collection(db, "submissions"), newSubmission);
    submission = { id: docRef.id, ...newSubmission };
  }

  if (submission) {
    setCurrentSubmission(submission);
    setSelectedTest(test);
    setCurrentPage('testTaker');
  }
};

    
    const submitTest = async (testId, answers, submissionId) => {
        const test = tests.find(t => t.id === testId);
        if (!test || !submissionId) return;

        let score = 0;
        test.questions.forEach(q => {
            const userAnswer = answers[q.id];
            if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
                if (q.type === 'MSQ') {
                    if (JSON.stringify([...(userAnswer || [])].sort()) === JSON.stringify([...(q.correctAnswer || [])].sort())) score++;
                } else if (String(userAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
                    score++;
                }
            }
        });

        const submissionRef = doc(db, "submissions", submissionId);
        const finalSubmissionData = {
            score, answers, status: 'completed', submitTime: serverTimestamp()
        };
        
        await updateDoc(submissionRef, finalSubmissionData);

        const localSubmissionCopy = { ...currentSubmission, ...finalSubmissionData };
        setLastSubmission(localSubmissionCopy);
        setCurrentPage('results');
    };

    const renderPage = () => {
        if (!authReady) return <LoadingScreen />;
        if (!user) return <LoginPage setUser={setUser} setCurrentPage={setCurrentPage} />;

        const initialPage = user.role === 'admin' ? 'adminDashboard' : 'userDashboard';

        switch (currentPage) {
            case 'adminDashboard': return <AdminDashboard tests={tests} setCurrentPage={setCurrentPage} setSelectedTest={setSelectedTest} user={user} handleLogout={handleLogout} />;
            case 'testCreator': return <TestCreator selectedTest={selectedTest} setCurrentPage={setCurrentPage} user={user} handleLogout={handleLogout} />;
            case 'analytics': return <AnalyticsPage test={selectedTest} setCurrentPage={setCurrentPage} />;
            case 'userDashboard': return <UserDashboard tests={tests} user={user} submissions={submissions} setCurrentPage={setCurrentPage} setSelectedTest={setSelectedTest} handleStartTest={handleStartTest} setLastSubmission={setLastSubmission} handleLogout={handleLogout} />;
            case 'testTaker': return <TestTaker test={selectedTest} currentSubmission={currentSubmission} submitTest={submitTest} setCurrentPage={setCurrentPage} />;
            case 'results':
                if (!lastSubmission || !selectedTest) {
                    setCurrentPage(initialPage);
                    return null;
                }
                return <ResultsPage submission={lastSubmission} test={selectedTest} setCurrentPage={setCurrentPage} />;
            default:
                 setCurrentPage(initialPage);
                 return null;
        }
    };

    return (
        <div style={styles.appContainer}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700;800&display=swap');
                body, html { margin: 0; padding: 0; font-family: 'Exo 2', sans-serif; background-color: #1a202c; color: white; }
                #root { min-height: 100vh; }
                * { box-sizing: border-box; }
                button, input, textarea, select { font-family: 'Exo 2', sans-serif; }
                button { cursor: pointer; border: none; padding: 0; background: none; }
                input:focus, textarea:focus, button:focus, select:focus, label:focus-within { outline: 2px solid #60a5fa; outline-offset: 2px; }
                input[type="radio"], input[type="checkbox"] { width: 18px; height: 18px; border: 1px solid rgba(255,255,255,0.4); border-radius: 4px; appearance: none; -webkit-appearance: none; background-color: transparent; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin: 0; }
                input[type="radio"] { border-radius: 50%; }
                input[type="radio"]:checked, input[type="checkbox"]:checked { background-color: #60a5fa; border-color: #60a5fa; }
                input[type="radio"]:checked::before { content: ''; display: block; width: 8px; height: 8px; border-radius: 50%; background-color: white; }
                input[type="checkbox"]:checked::before { content: '✔'; font-size: 12px; color: white; line-height: 1; display: block; }
            `}</style>
            {renderPage()}
        </div>
    );
}

// --- INLINE STYLES OBJECT ---
const styles = {
    appContainer: {
        backgroundColor: '#1a202c',
        minHeight: '100vh',
        color: 'white',
        fontFamily: "'Exo 2', sans-serif",
    },
    dashboardLayout: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px',
    },
    centeredPageLayout: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '16px',
    },
    testTakerLayout: {
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    h1: { fontSize: '36px', fontWeight: 'bold', color: 'white', letterSpacing: '-0.025em', margin: 0 },
    h2: { fontSize: '24px', fontWeight: '600', color: 'white', margin: 0 },
    card: { backgroundColor: '#2d3748', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)' },
    inputField: { width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', fontSize: '16px' },
    primaryButton: { backgroundColor: '#60a5fa', color: 'white', padding: '12px 20px', borderRadius: '8px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    secondaryButton: { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '12px 20px', borderRadius: '8px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' },
    iconButton: { padding: '8px', color: 'rgba(255,255,255,0.7)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    noDataText: { textAlign: 'center', color: 'rgba(255,255,255,0.6)', padding: '32px' },
    modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(6px)', padding: '16px' },
    modalContent: { backgroundColor: '#2d3748', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', width: '100%', maxWidth: '768px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)' },
    modalTitle: { fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0 },
    modalCloseButton: { color: '#a0aec0', padding: '4px', borderRadius: '9999px', display: 'flex' },
    modalBody: { padding: '24px', overflowY: 'auto' },
    timer: { display: 'flex', alignItems: 'center', fontWeight: '600', fontSize: '18px', padding: '8px 16px', borderRadius: '9999px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)' },
    logoutButton: { backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' },
    loginCard: { padding: '40px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '16px', width: '100%', maxWidth: '448px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' },
    listItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' },
    listItemTitle: { fontWeight: 'bold', fontSize: '18px', color: 'white', margin: 0 },
    listItemSubtitle: { fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0' },
    questionFormCard: { padding: '24px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: '24px' },
    uploadButton: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '14px', color: 'white', fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' },
    removeImageButton: { position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', borderRadius: '9999px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    optionItem: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
    uploadButtonSmall: { padding: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', color: 'white', display: 'flex' },
    removeImageButtonSmall: { position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: 'white', borderRadius: '9999px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    addOptionButton: { color: '#60a5fa', fontWeight: '600', fontSize: '14px', marginTop: '8px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '32px' },
    gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' },
    dashboardCard: { backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
    dashboardCardTitle: { fontWeight: 'bold', fontSize: '20px', color: 'white', marginBottom: '12px', margin: 0 },
    dashboardCardButtonGreen: { marginTop: '24px', width: '100%', backgroundColor: '#22c55e', color: 'white', padding: '10px 16px', borderRadius: '8px', fontWeight: '600' },
    dashboardCardButtonBlue: { marginTop: '24px', width: '100%', backgroundColor: '#3b82f6', color: 'white', padding: '10px 16px', borderRadius: '8px', fontWeight: '600' },
    testTakerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0 },
    testTakerMain: { flexGrow: 1, padding: '16px 0', overflowY: 'auto' },
    optionLabel: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' },
    testTakerFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', position: 'sticky', bottom: 0 },
    resultsCard: { width: '100%', maxWidth: '768px', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', padding: '40px', borderRadius: '16px', textAlign: 'center' },
    reviewCard: { padding: '20px', borderRadius: '12px', border: '1px solid' },
    backButton: { color: '#60a5fa', fontWeight: '600', marginBottom: '24px' },
    analyticsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' },
    analyticsStatCard: { backgroundColor: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' },
    analyticsStatTitle: { fontSize: '18px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', margin: 0 },
    analyticsStatValueBlue: { fontSize: '48px', fontWeight: 'bold', color: '#60a5fa', margin: '8px 0 0 0' },
    analyticsStatValueGreen: { fontSize: '48px', fontWeight: 'bold', color: '#4ade80', margin: '8px 0 0 0' },
    analyticsStatValueWhite: { fontSize: '48px', fontWeight: 'bold', color: 'white', margin: '8px 0 0 0' },
    barChartContainer: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', height: '256px', padding: '16px', borderLeft: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' },
    barChartItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: '1' },
    table: { width: '100%', textAlign: 'left', borderCollapse: 'collapse' },
    tableHeader: { padding: '12px 16px', color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.2)' },
    tableCell: { padding: '12px 16px', color: 'rgba(255,255,255,0.9)', borderBottom: '1px solid rgba(255,255,255,0.1)', verticalAlign: 'middle' },
    viewButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.8)',
        padding: '6px 12px',
        borderRadius: '6px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '14px',
        fontWeight: '500',
        border: '1px solid rgba(255,255,255,0.2)',
    }
};