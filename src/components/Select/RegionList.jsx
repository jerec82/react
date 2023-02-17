import React, { useState, useEffect } from "react";
import axios from "axios";
import { Select } from "antd";

//const baseURL = "http://10.10.1.133:8081/store";
const baseURL = "http://websrv2:8081/sp/tf";

const RegionList = (props) => {

    const [regionList,setRegionList] = useState([]);

    const getRegion = async () => {

        let res = await axios.get(baseURL);
        const regions = res.data;
        
        let arrayRegion=[];
        
        arrayRegion.push({
            value: 0,
            label: "Выбрать все фонды"
        })

        regions.map((region) => 
            {
                return (
                arrayRegion.push({
                    value: region.code,
                    label: region.code + ' | ' + region.name,
                }));
            });   
            setRegionList(arrayRegion);
    };

    useEffect(()=>{
        getRegion();
    },[]);

    const onChangeRegionList = (value) => {
        let tf = value;

        if (tf.length === 0) value = [0];
        
        
        for (let i = 0; i < tf.length; i++) {
            if (tf[i] === 0 && tf[0] !== 0) {
                console.log('Найден ноль');
                value = [0];
            } else if (tf[i] === 0 && tf[0] === 0) {
                tf.splice(0,1);
                value = tf;
            }
        }
        props.setValue(value);
    }

    return (
        <Select 
            mode="multiple"
            defaultValue={0}
            placeholder="Выберите TF"
            value={props.value}
            style={{width: '100%'}}
            maxTagCount={4}
            allowClear
            onChange={onChangeRegionList}             
            options={regionList}
            showSearch>
        </Select>
  );
}

export default RegionList