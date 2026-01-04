"use client";

import { useState } from 'react';
import { Upload, FileImage, Loader2, List, Type, Camera } from 'lucide-react';
import styles from './ReverseEngineering.module.css';

interface CameraSettings {
    aperture: string;
    shutter_speed: string;
    iso: string;
    exposure: string;
}

export default function ReverseEngineering() {
    const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>('');
    const [resultMode, setResultMode] = useState<'tags' | 'description' | 'technical'>('tags');
    const [analysisResult, setAnalysisResult] = useState<{
        description: string;
        description_zh: string;
        tags: string[];
        camera_settings?: CameraSettings;
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(URL.createObjectURL(file));
            setFileType(file.type);

            // Convert to Base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result?.toString().split(',')[1];
                if (base64String) setImageBase64(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const startAnalysis = async () => {
        if (!imageBase64) return;

        setStep('analyzing');

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageBase64, mimeType: fileType })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.details || 'Analysis failed');
            }

            const data = await response.json();
            setAnalysisResult(data);
            setStep('result');
        } catch (error: any) {
            console.error(error);
            alert(`Analysis failed: ${error.message}`);
            setStep('upload');
        }
    };

    const reset = () => {
        setSelectedImage(null);
        setImageBase64(null);
        setAnalysisResult(null);
        setStep('upload');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    AI Reverse Engineering 逆向工程 (Image to Prompt)
                </h2>
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.leftPanel}>
                    {selectedImage ? (
                        <div className={styles.previewContainer}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={selectedImage} alt="Preview" className={styles.previewImage} />
                            <button onClick={reset} className={styles.removeBtn}>Change 更換</button>
                        </div>
                    ) : (
                        <div className={styles.uploadArea}>
                            <input type="file" id="imageUpload" className="hidden" accept="image/*" onChange={handleFileChange} />
                            <label htmlFor="imageUpload" className={styles.uploadLabel}>
                                <div className={styles.uploadIconBox}>
                                    <Upload size={32} />
                                </div>
                                <span className={styles.uploadText}>Click or Drag to Upload Image<br />點擊或拖放上傳圖片</span>
                            </label>
                        </div>
                    )}
                </div>

                <div className={styles.rightPanel}>
                    {step === 'upload' && (
                        <div className={styles.emptyState}>
                            <FileImage size={48} className="mb-4 opacity-50" />
                            <p>上傳圖片以開始分析 (Upload an image to start analysis)</p>
                            {selectedImage && (
                                <button className={styles.primaryBtn} onClick={startAnalysis}>
                                    開始 Gemini 分析 (Start Gemini Analysis)
                                </button>
                            )}
                        </div>
                    )}

                    {step === 'analyzing' && (
                        <div className={styles.loadingState}>
                            <Loader2 size={40} className="animate-spin text-purple-500 mb-4" />
                            <p>正在使用 Gemini 分析圖片... (Analyzing image...)</p>
                            <p className="text-sm text-gray-400 mt-2">正在偵測物件、光影與風格 (Detecting objects, lighting, and style)</p>
                        </div>
                    )}

                    {step === 'result' && analysisResult && (
                        <div className={styles.resultContainer}>
                            <div className={styles.tabs}>
                                <button
                                    className={`${styles.tab} ${resultMode === 'tags' ? styles.activeTab : ''}`}
                                    onClick={() => setResultMode('tags')}
                                >
                                    <List size={16} /> 標籤 (Label Mode)
                                </button>
                                <button
                                    className={`${styles.tab} ${resultMode === 'description' ? styles.activeTab : ''}`}
                                    onClick={() => setResultMode('description')}
                                >
                                    <Type size={16} /> 描述 (Description)
                                </button>
                                <button
                                    className={`${styles.tab} ${resultMode === 'technical' ? styles.activeTab : ''}`}
                                    onClick={() => setResultMode('technical')}
                                >
                                    <Camera size={16} /> 參數 (Technical)
                                </button>
                            </div>

                            <div className={styles.resultContent}>
                                {resultMode === 'tags' ? (
                                    <div className={styles.tagCloud}>
                                        {analysisResult.tags.map(tag => (
                                            <span key={tag} className={styles.resultTag}>{tag}</span>
                                        ))}
                                    </div>
                                ) : resultMode === 'description' ? (
                                    <div className={styles.descriptionText}>
                                        <p className="mb-4">{analysisResult.description}</p>
                                        <hr className="border-gray-700 my-2" />
                                        <p className="text-gray-400">{analysisResult.description_zh}</p>
                                    </div>
                                ) : (
                                    /* Technical Specs Display */
                                    <div className={styles.techGrid}>
                                        {analysisResult.camera_settings ? (
                                            <>
                                                <div className={styles.techItem}>
                                                    <span className={styles.techLabel}>光圈 (Aperture)</span>
                                                    <span className={styles.techValue}>{analysisResult.camera_settings.aperture}</span>
                                                </div>
                                                <div className={styles.techItem}>
                                                    <span className={styles.techLabel}>快門 (Shutter)</span>
                                                    <span className={styles.techValue}>{analysisResult.camera_settings.shutter_speed}</span>
                                                </div>
                                                <div className={styles.techItem}>
                                                    <span className={styles.techLabel}>感光度 (ISO)</span>
                                                    <span className={styles.techValue}>{analysisResult.camera_settings.iso}</span>
                                                </div>
                                                <div className={styles.techItem}>
                                                    <span className={styles.techLabel}>曝光 (Exposure)</span>
                                                    <span className={styles.techValue}>{analysisResult.camera_settings.exposure}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-500">此圖片無技術參數資料 (No technical data available)</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className={styles.actions}>
                                <button className={styles.secondaryBtn} onClick={() => {
                                    let textToCopy = "";
                                    if (resultMode === 'tags') textToCopy = analysisResult.tags.join(', ');
                                    else if (resultMode === 'description') textToCopy = `${analysisResult.description}\n${analysisResult.description_zh}`;
                                    else if (resultMode === 'technical' && analysisResult.camera_settings) {
                                        const c = analysisResult.camera_settings;
                                        textToCopy = `Camera: ${c.iso}, ${c.aperture}, ${c.shutter_speed}, ${c.exposure}`;
                                    }
                                    navigator.clipboard.writeText(textToCopy);
                                    alert('Copied to clipboard!');
                                }}>
                                    Copy 複製
                                </button>
                                <button className={styles.secondaryBtn} onClick={reset}>
                                    Start Over 重新開始
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
