import React, { useEffect, useState, Fragment } from "react";
import ThreeMap from "../ThreeMap";
import Bar from "../ThreeMap/components/Bar";
import Line from "../ThreeMap/components/Line";
import HaloPoint from "../ThreeMap/components/HaloPoint";
import encoder from 'geojson-decoder';
import chinaData from "../ThreeMap/mapData/china.json";
import zjJson from "../ThreeMap/mapData/zhejiang.json";

const geojson = encoder.decode(chinaData);

let barData = [
    { name: '浙江省', value: 60, center: [120.153576, 30.287459] },
    { name: '湖北省', value: 80, center: [114.298572, 30.584355] },
    { name: '青海省', value: 80, center: [101.778916, 36.623178] },
    { name: '黑龙江省', value: 90, center: [126.642464, 45.756967] },
    { name: '内蒙古自治区', value: 100, center: [111.670801, 40.818311] },
    { name: '台湾省', value: 60, center: [121.509062, 25.044332] }
];

const lineData = [
    {
        source: { name: '青海省', center: [101.778916, 36.623178] },
        target: { name: '浙江省', center: [120.153576, 30.287459] }
    },
    {
        source: { name: '青海省', center: [101.778916, 36.623178] },
        target: { name: '湖北省', center: [114.298572, 30.584355] }
    },
    {
        source: { name: '青海省', center: [101.778916, 36.623178] },
        target: { name: '黑龙江省', center: [126.642464, 45.756967] }
    },
    {
        source: { name: '青海省', center: [101.778916, 36.623178] },
        target: { name: '内蒙古自治区', center: [111.670801, 40.818311] }
    },
    {
        source: { name: '青海省', center: [101.778916, 36.623178] },
        target: { name: '台湾省', center: [121.509062, 25.044332] }
    }
];

export default props => {

    useEffect(() => {
        const zjConfig = {
            center: [120.149506, 29.089524],
            depth: 0.5, // 地图深度
            camera: {
                position: [80, 5, 120],
                fov: 4
            },
            text: {
                show: true
            }
        };
        // 初始化地图
        const dom = document.getElementById('myMap');
        const map = new ThreeMap({}, geojson);
        map.init(dom);

        map.hover = ((data) => {
            console.log(data);
        });

        // 加光柱 - 转换地图3维坐标
        barData.forEach(item => {
            item.center = map.lnglatToVector3(item.center);
        });
        const barInstance = new Bar({}, barData);
        map.scene.add(barInstance.group);

        // 加光晕点
        const haloPointInstance = new HaloPoint({}, barData);
        map.scene.add(haloPointInstance.group);

        // 加飞线 - 转换地图3维坐标
        lineData.forEach(item => {
            item.source.center = map.lnglatToVector3(item.source.center);
            item.target.center = map.lnglatToVector3(item.target.center);
        });
        const lineInstance = new Line({}, lineData);
        map.scene.add(lineInstance.group);

        console.log(map);

        return () => {
            barInstance.destroy();
            haloPointInstance.destroy();
            lineInstance.destroy();
            map.destroy();
            console.log("销毁了");
        }
    }, []);

    return (
        <div id="myMap" style={{ width: "100%", height: 700, position: "relative" }}></div>
    );
};

