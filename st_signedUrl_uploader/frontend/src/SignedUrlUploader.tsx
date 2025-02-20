import React, { ReactNode } from "react";
import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib";

interface FileData {
  filename: string;
  content_type: string;
}

interface State {
  filesData: FileData;
  signedUrl: string;
  uploading: boolean; // Track upload state
  progress: number;   // Track progress (0-100%)
}

class SignedUrlUploader extends StreamlitComponentBase<State> {
  public state: State = { 
    filesData: { filename: '', content_type: '' }, 
    signedUrl: '', 
    uploading: false, 
    progress: 0 
  };

  public render = (): ReactNode => {
    const { theme } = this.props;

    // Detect dark mode from Streamlit theme or system
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDarkMode = theme?.base === "dark" || (!theme && prefersDark);

    const textColor = isDarkMode ? "white" : "black";
    const borderColor = isDarkMode ? "white" : "black";
    const backgroundColor = isDarkMode ? "#444" : "#f9f9f9";

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',  
      flexDirection: 'column',
    };

    const buttonStyle: React.CSSProperties = {
      border: `1px solid ${borderColor}`,
      outline: `1px solid ${borderColor}`,
      backgroundColor,
      color: textColor,
      padding: '10px 15px',
      borderRadius: '5px',
      cursor: this.state.uploading ? "not-allowed" : "pointer",
      opacity: this.state.uploading ? 0.7 : 1,
    };

    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={containerStyle}>
          <input
            type="file"
            onChange={this.onFileUpload}
            disabled={this.state.uploading}
            style={{
              ...buttonStyle,
              backgroundColor: 'transparent',
              color: textColor,
            }}
          />
          <button 
            style={buttonStyle} 
            onClick={this.onClicked}
            disabled={this.state.uploading}
          >
            {this.state.uploading ? "Uploading..." : "Upload"}
          </button>

          {/* Spinner */}
          {this.state.uploading && (
            <div style={{ marginTop: "10px", color: textColor }}>
              🔄 Uploading...
            </div>
          )}

          {/* Progress Bar */}
          {this.state.uploading && (
            <div style={{
              width: "100%", 
              height: "10px", 
              backgroundColor: "#ddd", 
              borderRadius: "5px", 
              overflow: "hidden", 
              marginTop: "10px"
            }}>
              <div style={{
                width: `${this.state.progress}%`, 
                height: "100%", 
                backgroundColor: isDarkMode ? "lightgreen" : "green",
                transition: "width 0.2s ease-in-out"
              }} />
            </div>
          )}
        </div>
      </div>
    );
  };

  private onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    const signedUrl = this.props.args["signed_url"];

    if (file && signedUrl) {
      try {
        this.setState({ uploading: true, progress: 0 });

        const filesData: FileData = {
          filename: file.name,
          content_type: file.type,
        };

        this.setState({ filesData });

        if (!file.name.endsWith('.DS_Store')) {
          await this.uploadFile(file, signedUrl);
        }
      } catch (error) {
        console.error(error);
        alert(`Error uploading file ${file.name}: ${error}`);
      } finally {
        this.setState({ uploading: false, progress: 100 });
      }
    } else {
      console.error("File or signed URL is missing.");
    }
  };

  private uploadFile = async (file: File, signedUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", signedUrl, true);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          this.setState({ progress: percentComplete });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error occurred during file upload."));
      xhr.send(file);
    });
  };

  private onClicked = (): void => {
    if (this.state.filesData.filename) {
      Streamlit.setComponentValue(this.state.filesData);
      this.setState({ filesData: { filename: '', content_type: '' }, progress: 0 });
    } else {
      alert('Please upload a new file before clicking upload.');
    }
  };
}

export default withStreamlitConnection(SignedUrlUploader);
