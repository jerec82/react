import React, { useState } from 'react';
import "dayjs/locale/ru";
import './App.css';
import { Button, Select, DatePicker, Space, Card, Tabs, Upload, message} from 'antd';

import RegionList from './components/Select/RegionList';
import { DownloadOutlined} from '@ant-design/icons';
import { UploadOutlined} from '@ant-design/icons';
import Info from './components/Alert/Info';

function App() {

  const [region,setRegion] = useState([0]);
  const [direct,setDirect] = useState('in');
  const [directUpload, setDirectUpload] = useState('in');

  const [stateButtonDownload, setStateButtonDownload] = useState(true);
  const [stateButtonUpload, setStateButtonUpload] = useState(true);
  const [stateDateBeginValue, setStateDateBeginValue] = useState(null);
  const [stateDateEndValue, setStateDateEndValue] = useState(null);

  const [stateMessage, setStateMessage] = useState('Загрузите файл');
  const [stateTypeMessage, setStateTypeMessage] = useState();

  const [download, setDownload] = useState();
  const [upload, setUpload] = useState();
  
  const [loading, setLoading] = useState(false);

  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  let statusUpload;
  let filenameUpload;
  
  const handleUpload = () => {
    setUploading(true);
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('file', file);
    })

    formData.append('direction', directUpload);

    //fetch('http://10.10.1.133:8080/api/upload',
    fetch('http://websrv2:8081/issmtr/refunds',
    { method: 'POST',
      body: formData,
    })
    
    .then((res) => { 
      statusUpload = res.status;
      if (res.status === 201 ) {
        //message.success('Файл загружен');
        setStateMessage('Файл успешно загружен');
        setStateTypeMessage('success');
      } else {
        //message.error('Найдены ошибки');
        setStateMessage('Найдены ошибки при загрузке файла');
        setStateTypeMessage('error');

        setStateButtonUpload(false);

        const header = res.headers.get('Content-Disposition');
        const parts = header.split(';');
        filenameUpload = parts[1].split('=')[1].replaceAll("\"","");
        return res.blob();
      }})

    .then ((data) => {
      if (statusUpload !== 201) { 
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(data);
        a.download = filenameUpload;
        setUpload(a);
        //a.click();
        //a.remove();
      }
    }) 
    .catch((error) => {
      message.error('Ошибка загрузки файл' + error);
    })
    .finally(() => {
      setUploading(false);
    })
  }
  
  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },

    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  const onChangeDateBegin = (value) => {
    setStateDateBeginValue(value);
  }

  const onChangeDateEnd = (value) => {
    setStateDateEndValue(value);
  }

  const onChangeDirect = (value) => {
    setDirect(value);
  };

  const onChangeDirectUpload = (value) => {
    setDirectUpload(value);
  }

  const onClickButton = async () => {
   
    let checkDates = true;
    let checkTF = true;

    if (stateDateBeginValue === null) {
      alert('Начальная дата не может быть пустой');
      checkDates = false;
    }
    
    if (stateDateEndValue === null) {
      alert('Конечная дата не может быть пустой');
      checkDates = false;
    }
    
    // Проверка дат
    if ((stateDateBeginValue < stateDateEndValue) === false && checkDates === true) {
      alert('Начальная дата должна быть больше конечной');
      checkDates = false;
    }

    // Проверка на пустой список TF
    if (region.length === 0) {
      alert('Список фондов не должен быть пустым');
      checkTF = false;
      setRegion([0]);
    }

    let filename;

    if ((checkDates) && (checkTF)) {
    
      setLoading(true);

      let json = {
        direction: direct,
        databegin: stateDateBeginValue.format('DD.MM.YYYY'),
        dataend: stateDateEndValue.format('DD.MM.YYYY'),
        tf: region.toString()
      };
  
      //await fetch('http://10.10.1.133:8080/api/iismtr', {
      await fetch('http://websrv2:8081/issmtr/schet', {
      method: 'POST',
      headers: {'Content-Type':'application/json; charset=utf-8'},
      body : JSON.stringify(json)
      })
      .then ((res) => { 
        const header = res.headers.get('Content-Disposition');
        const parts = header.split(';');
        filename = parts[1].split('=')[1].replaceAll("\"","");
        return res.blob();})
      .catch ((error) => {
        alert('Ошибка соединения: '+ error);
      })
      .then ((data) => {
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(data);
        a.download = filename;
        setDownload(a);
        //a.click();
        //a.remove();
        setLoading(false);
        setStateButtonDownload(false);
      });
    };   
  };
  
  const onClickDownload = () => {
    download.click();
  }

  const onClickUpload = () => {
    upload.click();
  }
  
  return (

  <div className='App'>

    <Tabs 
      type='card' 
      defaultActiveKey='1'
      items={[
        {
          label:'Формирование счетов',
          key: '1',
          children: 
            <>
              <Space>&nbsp;&nbsp;&nbsp;</Space>
                <Space direction='vertical' style={{width: '25%',}}>
                  <Card title='Выберите отчетный период' size='small' align='left' type='inner'>
                    <DatePicker placement='bottomLeft' format='DD.MM.YYYY' showToday={false} style={{width: '250px',}} status='warning' onChange={onChangeDateBegin}></DatePicker>
                    <br /><br />
                    <DatePicker placement='bottomLeft' format='DD.MM.YYYY' style={{width: '250px', }} status='warning' onChange={onChangeDateEnd}></DatePicker>
                  </Card>
                </Space>
              <Space>&nbsp;&nbsp;&nbsp;</Space>

              <Space direction='vertical' style={{width: '70%',}}>
                <Card title='Выберите территориальный фонд' size='small' align='left' type='inner'>
                  <RegionList value={region} setValue={setRegion} />
                </Card>
                <Card title='Выберите тип документа' size='small' align='left' type='inner'>
                  <Select style={{width: '250px',}} defaultValue={'in'} onChange={onChangeDirect} options={[ {value: 'in', label: 'Входящий'}, {value: 'out', label: 'Исходящий'},]} />
                </Card>
                <Card size='small'>
                  <Button disabled={stateButtonDownload} loading={loading} icon={<DownloadOutlined/>} type = 'primary' size='default' onClick={onClickDownload}>Скачать отчет</Button>&nbsp;
                  <Button loading={loading} onClick={onClickButton} type='primary' size='default'>Сформировать отчет</Button>
                </Card>
              </Space>
              <br />
              <br />
            </>,
        }, 
        {
          label: 'Загрузка возвратов',
          key: '2',
          children: 
            <>
              <Space direction='vertical' style={{width: '50%',}}>
                <Info stateMessage={stateMessage} stateTypeMessage={stateTypeMessage} setStateMessage={setStateMessage} setStateTypeMessage={setStateTypeMessage}></Info>          
                <Card title='Выберите тип реестра' align='left' type='inner' size='small'>
                  <Select style={{width: '250px',}} defaultValue={'in'} onChange={onChangeDirectUpload} options={[ {value: 'in', label: 'Входящий'}, {value: 'out', label: 'Исходящий'},]} />
                </Card>
                <Card title='Выбор файла для загрузки' align='left' type='inner' size='small'>
                  <Upload {...props} listType="picture">
                    <Button icon={<UploadOutlined/>}>Выберите файл</Button>
                  </Upload>
                </Card>
                <Card size='small'>
                  <Button disabled={stateButtonUpload} icon={<DownloadOutlined/>} type='primary' size='default' onClick={onClickUpload}>Скачать отчет</Button>&nbsp;
                  <Button type='primary' onClick={handleUpload} disabled={fileList.length === 0 || fileList.length > 1} loading={uploading}> {uploading ? 'Загрузка' : 'Начать загрузку'} </Button>
                </Card>
              </Space>
            </>,
        },
      ]}
    />
  </div>
  );
}

export default App;