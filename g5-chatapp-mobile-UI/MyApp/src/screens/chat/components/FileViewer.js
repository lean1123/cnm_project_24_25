import React from 'react';
import { View, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

// FileViewer screen
const FileViewer = ({ route }) => {
    const navigation = useNavigation();
    const { uri } = route.params;
    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(uri)}&embedded=true`;

    return (
        <View style={styles.container}>
            <Button title="Quay lại" onPress={() => navigation.goBack()} />
            <WebView 
                source={{ uri: viewerUrl }}
                startInLoadingState={true}
                renderLoading={() => (
                    <ActivityIndicator 
                        size="large" 
                        color="#0000ff" 
                        style={styles.loadingIndicator} 
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default FileViewer;
