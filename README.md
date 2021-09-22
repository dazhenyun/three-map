# 基于ThreeJs封装的地图组件

# 安装
```bash
npm install @dzv/three-map --save
```

# 如何使用
```jsx
import ThreeMap from "@dzv/three-map";

// 初始化地图
const dom = document.getElementById('myMap');
const map = new ThreeMap({}, geojson);
map.init(dom);

```

## 地图config配置
|    参数   | 说明    | 类型    |  默认值         |
| :------  | :----- | :----   | :------ | :---------- |
| background  | 背景颜色 | string  |  #11182f        |
| center     | 地图中心点经纬度  | array  |  [103.754443, 30.544037]         |
| scale    |  地图缩放 | number  |  80      |
| translate   |   地图平移     | array |  [0, 0]    |
| depth |    地图深度    | number |  2       |
| line.color  |    轮廓线颜色 | string   | #5a77c5           |
| area.color  |   区域颜色  | string   |  #344e85          |
| area.opacity |    区域透明度  | float   |  0.7          |
| area.hover |   是否开启区域hover效果  | boolean |  true          |
| area.hoverColor |   区域鼠标悬浮颜色  | string |  #5576bb          |
| area.upHover |   是否开启区域悬浮凸起效果  | boolean |  false          |
| area.upHoverDepth |   区域凸起深度  | number |  2          |
| controls.enableZoom |   启用或禁用摄像机的缩放  | boolean |  true          |
| controls.zoomSpeed |   缩放速度  | number |  1          |
| controls.minDistance |   缩放最小  | number |  10          |
| controls.maxDistance |   缩放最大  | number |  1000          |
| camera.position |   相机x,y,z 对象三维坐标  | array |  [80, 5, 100]          |
| camera.lookAt |   x,y,z相机看的位置  | array |    [0, 0, 0]        |
| camera.fov |   摄像机视锥体垂直视野角度  | number |  35          |
| camera.near |   摄像机视锥体近端面  | number |  1          |
| camera.far |   摄像机视锥体远端面  | number |  10000          |
| text.show |   地名是否显示  | boolean |  false          |
| text.color |   字体颜色  | string |  #fff          |
| text.fontSize |   字体大小  | number |  12          |

## Method方法
|    参数   | 说明    | 例子 |
| :------  | :----- |  :----- |
| map.scene.add()  | 接入外部组件的方法 | map.scene.add(group) |
| map.lnglatToVector3()  | 经纬度转地图三维坐标 | map.lnglatToVector3(Array[]) |
| map.destroy()  | 销毁 | map.destroy() |

## 内置地图数据
```jsx
import china from "@dzv/three-map/lib/mapData/china.json"; // 中国地图
import shanghai from "@dzv/three-map/lib/mapData/shanghai.json"; // 上海市
import yunnan from "@dzv/three-map/lib/mapData/yunnan.json"; // 云南省
import neimenggu from "@dzv/three-map/lib/mapData/neimenggu.json"; // 内蒙古自治区
import beijing from "@dzv/three-map/lib/mapData/beijing.json"; // 北京市
import taiwan from "@dzv/three-map/lib/mapData/taiwan.json"; // 台湾省
import jilin from "@dzv/three-map/lib/mapData/jilin.json"; // 吉林省
import sichuan from "@dzv/three-map/lib/mapData/sichuan.json"; // 四川省
import tianjin from "@dzv/three-map/lib/mapData/tianjin.json"; // 天津市
import ningxia from "@dzv/three-map/lib/mapData/ningxia.json"; // 宁夏回族自治区
import anhui from "@dzv/three-map/lib/mapData/anhui.json"; // 安徽省
import shandong from "@dzv/three-map/lib/mapData/shandong.json"; // 山东省
import shanxi from "@dzv/three-map/lib/mapData/shanxi.json"; // 山西省
import guangdong from "@dzv/three-map/lib/mapData/guangdong.json"; // 广东省
import guangxi from "@dzv/three-map/lib/mapData/guangxi.json"; // 广西壮族自治区
import xinjiang from "@dzv/three-map/lib/mapData/xinjiang.json"; // 新疆维吾尔族自治区
import jiangsu from "@dzv/three-map/lib/mapData/jiangsu.json"; // 江苏省
import jiangxi from "@dzv/three-map/lib/mapData/jiangxi.json"; // 江西省
import hebei from "@dzv/three-map/lib/mapData/hebei.json"; // 河北省
import henan from "@dzv/three-map/lib/mapData/henan.json"; // 河南省
import zhejiang from "@dzv/three-map/lib/mapData/zhejiang.json"; // 浙江省
import hainan from "@dzv/three-map/lib/mapData/hainan.json"; // 海南省
import hubei from "@dzv/three-map/lib/mapData/hubei.json"; // 湖北省
import hunan from "@dzv/three-map/lib/mapData/hunan.json"; // 湖南省
import anmen from "@dzv/three-map/lib/mapData/aomen.json"; // 澳门特别行政区
import gansu from "@dzv/three-map/lib/mapData/gansu.json"; // 甘肃省
import fujian from "@dzv/three-map/lib/mapData/fujian.json"; // 福建省
import xizang from "@dzv/three-map/lib/mapData/xizang.json"; // 西藏自治区
import guizhou from "@dzv/three-map/lib/mapData/guizhou.json"; // 贵州省
import liaoning from "@dzv/three-map/lib/mapData/liaoning.json"; // 辽宁省
import chongqing from "@dzv/three-map/lib/mapData/chongqing.json"; // 重庆市
import shanxisheng from "@dzv/three-map/lib/mapData/shanxisheng.json"; // 陕西省
import qinghai from "@dzv/three-map/lib/mapData/qinghai.json"; // 青海省
import xianggang from "@dzv/three-map/lib/mapData/xianggang.json"; // 香港特别行政区
import heilongjiang from "@dzv/three-map/lib/mapData/heilongjiang.json"; // 黑龙江省

import encoder from "geojson-decoder"; // geojson解码工具
const heilongjiangGeojson = encoder.decode(heilongjiang); // 解码 -- 所有内置地图数据都需要解码

```
