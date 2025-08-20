import * as React from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function UploadButton() {
    const [ fileName, setFileName ] = useState(null);

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('excel_file', file);
        // formData.append('additional_data', JSON.stringify({key: 'value'})); // 추가 데이터가 있다면
        
        try {
            const response = await fetch('http://127.0.0.1:8000/api/upload-excel/', {
            method: 'POST',
            body: formData,
            // headers: {
            //     'Authorization': `Bearer ${token}`, // 인증이 필요한 경우
            //     // Content-Type은 자동으로 설정되므로 추가하지 않음
            // }
            });
            
            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

  return (
    <>
        <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
        >
        Upload files
        <VisuallyHiddenInput
            type="file"
            onChange={(event) => 
                {
                    console.log(event.target.files[0].name);
                    setFileName(event.target.files[0].name);
                    handleFileUpload(event.target.files[0]);
                }}
            multiple
        />
        </Button>
        { fileName && <h3>{fileName}</h3> }
    </>

  );
}