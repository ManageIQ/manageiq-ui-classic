import React, { useRef, useState } from 'react';
import {Button} from '@carbon/react'; 
import { canvasController } from '../App';
import { getConvertedJson } from './convertASLtoJSON';

function JsonFileLoader() {
  const fileInputRef = useRef(null);
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState('');

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log(file);
    if (!file) return;

    const reader = new FileReader();
    // reader.readAsText(file);
    // console.log(reader.result);
    reader.onload = (e) => {
      try {
        const parsedJson = JSON.parse(e.target.result);
        const convertedJson = getConvertedJson(parsedJson);
        console.log(convertedJson)
        canvasController.setPipelineFlow(convertedJson);
        var pipelineFlow = canvasController.getPipelineFlow();
        //var links = canvasController.getLinks(pipelineFlow.primary_pipleine);
        //console.log(links);
        //setJsonData(parsedJson);
        setError('');
      } catch (err) {
       // setJsonData(null);
        setError('Invalid JSON file.');
        console.error('Error parsing JSON:', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <Button onClick={openFileDialog}  style={{float:"right" ,marginLeft:1  }}>Import </Button>
      <input
        type="file"
        accept=".asl"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* {error && <p style={{ color: 'red' }}>{error}</p>}
      {jsonData && (
        <pre>{JSON.stringify(jsonData, null, 2)}</pre>
      )} */}
    </div>
  );
}

export default JsonFileLoader;
