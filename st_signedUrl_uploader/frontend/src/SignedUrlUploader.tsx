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
}

class SignedUrlUploader extends StreamlitComponentBase<State> {
  public state: State = { filesData: { filename: '', content_type: '' }, signedUrl: '' };

  public render = (): ReactNode => {
    const { theme } = this.props;

    // Detect system preference if `theme` is not provided by Streamlit
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Define colors based on mode
    const isDarkMode = theme?.base === "dark" || (!theme && prefersDark);
    const textColor = isDarkMode ? "white" : "black";
    const borderColor = isDarkMode ? "white" : "black";
    const backgroundColor = isDarkMode ? "#444" : "#f9f9f9";

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',  
    };

    const style: React.CSSProperties = {
      border: `1px solid ${borderColor}`,
      outline: `1px solid ${borderColor}`,
      backgroundColor,
      color: textColor,
      padding: '10px 15px',
      borderRadius: '5px',
    };

    return (
      <div style={{ padding: "20px" }}>
        <div style={containerStyle}>
          <input
            type="file"
            onChange={this.onFileUpload}
            style={{
              ...style, 
              backgroundColor: 'transparent',
              color: textColor,
            }}
          />
          <button style={style} onClick={this.onClicked}>
            Upload
          </button>
        </div>
      </div>
    );
  };

  private onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    const signedUrl = this.props.args["signed_url"];

    if (file && signedUrl) {
      try {
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
      }
    } else {
      console.error("File or signed URL is missing.");
    }
  };

  private uploadFile = async (file: File, signedUrl: string): Promise<void> => {
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'application/octet-stream'  
      }
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed for file: ${file.name}`);
    }
  };

  private onClicked = (): void => {
    if (this.state.filesData.filename) {
      Streamlit.setComponentValue(this.state.filesData);
      this.setState({ filesData: { filename: '', content_type: '' } });
    } else {
      alert('Please upload a new file before clicking upload.');
    }
  };
}

export default withStreamlitConnection(SignedUrlUploader);
