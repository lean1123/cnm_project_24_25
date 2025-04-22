import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView, Share, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// FileViewer screen
const FileViewer = ({ route }) => {
    const navigation = useNavigation();
    const { uri, fileName } = route.params;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloading, setDownloading] = useState(false);

    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(uri)}&embedded=true`;
    
    const displayFileName = fileName || uri.split('/').pop() || 'File';
    
    const getFileExtension = () => {
        return displayFileName.split('.').pop().toLowerCase();
    };
    
    const getFileType = () => {
        const ext = getFileExtension();
        if (['pdf'].includes(ext)) return 'PDF';
        if (['doc', 'docx'].includes(ext)) return 'Word';
        if (['xls', 'xlsx'].includes(ext)) return 'Excel';
        if (['ppt', 'pptx'].includes(ext)) return 'PowerPoint';
        if (['txt'].includes(ext)) return 'Text';
        return 'Document';
    };

    const handleShare = async () => {
        try {
            // On iOS we can directly share the URL
            if (Platform.OS === 'ios') {
                await Share.share({
                    url: uri,
                    title: displayFileName,
                });
                return;
            }
            
            // On Android we need to download the file first
            setDownloading(true);
            
            const localUri = FileSystem.documentDirectory + displayFileName;
            const downloadResumable = FileSystem.createDownloadResumable(
                uri,
                localUri,
                {},
                (downloadProgress) => {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    setDownloadProgress(progress);
                }
            );
            
            const { uri: fileUri } = await downloadResumable.downloadAsync();
            
            setDownloading(false);
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                alert("Chia sẻ không khả dụng trên thiết bị này");
            }
        } catch (error) {
            console.error("Error sharing file:", error);
            setDownloading(false);
            alert("Không thể chia sẻ tệp. Vui lòng thử lại sau.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="chevron-left" size={30} color="white" />
                    <Text style={styles.headerTitle}>
                        {getFileType()}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.shareButton}
                    onPress={handleShare}
                    disabled={downloading}
                >
                    {downloading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Icon name="share-variant" size={24} color="white" />
                    )}
                </TouchableOpacity>
            </View>
            
            <View style={styles.fileInfoContainer}>
                <Icon name={getFileIcon(displayFileName)} size={24} color="#666" style={styles.fileIcon} />
                <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                    {displayFileName}
                </Text>
            </View>
            
            <View style={styles.viewerContainer}>
                <WebView 
                    source={{ uri: viewerUrl }}
                    startInLoadingState={true}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    onError={(e) => {
                        console.error('WebView error:', e.nativeEvent);
                        setError('Không thể tải tệp. Vui lòng tải xuống để xem.');
                        setLoading(false);
                    }}
                    renderLoading={() => (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#0099ff" />
                            <Text style={styles.loadingText}>Đang tải tài liệu...</Text>
                        </View>
                    )}
                />
                
                {error && (
                    <View style={styles.errorContainer}>
                        <Icon name="alert-circle-outline" size={40} color="#e74c3c" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity 
                            style={styles.downloadButton}
                            onPress={() => {
                                if (uri) {
                                    Linking.openURL(uri);
                                }
                            }}
                        >
                            <Icon name="download" size={18} color="white" style={styles.downloadIcon} />
                            <Text style={styles.downloadText}>Tải xuống</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

// Helper function to determine the file icon
const getFileIcon = (fileName) => {
    if (!fileName) return "file-document-outline";
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
        case "pdf":
            return "file-pdf-box";
        case "doc":
        case "docx":
            return "file-word";
        case "xls":
        case "xlsx":
            return "file-excel";
        case "ppt":
        case "pptx":
            return "file-powerpoint";
        case "zip":
        case "rar":
        case "7z":
            return "zip-box";
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
            return "file-image";
        case "mp3":
        case "wav":
        case "ogg":
            return "file-music";
        case "mp4":
        case "avi":
        case "mov":
            return "file-video";
        case "txt":
            return "file-document";
        default:
            return "file-document-outline";
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f6fb',
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        backgroundColor: "#135CAF",
        height: 70,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        marginLeft: 10,
    },
    shareButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#ffffff33',
    },
    fileInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    fileIcon: {
        marginRight: 12,
    },
    fileName: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        color: '#333',
    },
    viewerContainer: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        overflow: 'hidden',
        marginTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f6fb',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fef3f3',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 10,
        fontSize: 16,
        color: '#c0392b',
        textAlign: 'center',
        marginBottom: 20,
    },
    downloadButton: {
        flexDirection: 'row',
        backgroundColor: '#e74c3c',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    downloadIcon: {
        marginRight: 8,
    },
    downloadText: {
        color: 'white',
        fontWeight: '600',
    },
});


export default FileViewer;
