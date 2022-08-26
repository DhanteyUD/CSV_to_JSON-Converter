/** @format */

import './App.css';
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function App() {
  const [parsedCsvData, setParsedCsvData] = useState([]);
  const [fileName, setFileName] = useState('');

  const parseFile = (file) => {
    const allFileContents = new FileReader();
    allFileContents.readAsText(file);
    allFileContents.onload = function (e) {
      const csvData = e.target.result;

      const Data = [];
      const lines = csvData.split(/\r?\n/);
      let employees_attendance_records = {};
      let done_with_record = false;
      let current_user;

      lines.forEach((line) => {
        let current_data = line;

        if (!done_with_record) {
          if (current_data.startsWith('"')) {
            const user_id = current_data.slice(
              current_data.lastIndexOf('ID'),
              -1
            );
            current_user = user_id;
            employees_attendance_records[current_user] = [];
          } else if (
            current_data.startsWith('SN') ||
            current_data.startsWith('Total')
          ) {
            return;
          } else if (current_data.match(/[1-9]/)) {
            // eslint-disable-next-line no-unused-vars
            let [SN, Date, Clockin, Clockout, Total] = current_data.split(',');
            const user_data = {
              hoursWorked: parseInt(Total.split(':')[0]),
              minutesWorked: parseInt(Total.split(':')[1]),
              clockInTime: Clockin.replace(/"/g, ''),
              clockOutTime: Clockout.replace(/"/g, ''),
            };
            employees_attendance_records[current_user].push(user_data);
            Data.push(employees_attendance_records);
          } else if (current_data.startsWith(',')) {
            done_with_record = true;
          }
        } else if (done_with_record) {
          if (current_data.startsWith('"')) {
            let id = current_data.slice(current_data.lastIndexOf('ID'), -1);
            current_user = id;
            employees_attendance_records[current_user] = [];
          }
          done_with_record = false;
        }
      });
      setParsedCsvData(Data[0]);
    };
  };

  console.log('ParsedCSVdata', parsedCsvData);
  console.table('ParsedCSVdata', parsedCsvData);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length) {
      parseFile(acceptedFiles[0]);
      const fileName = acceptedFiles[0].name;
      setFileName(fileName);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: 'text/csv',
  });

  const handleDownload = () => {
    const fileName = 'Output';
    const json = JSON.stringify(parsedCsvData);
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName + '.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="App">
        <div
          {...getRootProps({
            className: `dropzone 
          ${isDragAccept && 'dropzoneAccept'} 
          ${isDragReject && 'dropzoneReject'}`,
          })}
        >
          <p className="d-n-d">
            Drag 'n' drop some files here, or click to select files
          </p>
          <input {...getInputProps()} />
          {isDragActive ? <p>Drop the files here ...</p> : <p>{fileName}</p>}
        </div>
        <button className="button" type="download" onClick={handleDownload}>
          {' '}
          Download JSON format
        </button>
      </div>
    </>
  );
}

export default App;
