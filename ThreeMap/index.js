import * as THREE from 'three';
import { OrbitControls } from "./vender/OrbitControls";
import * as d3Geo from 'd3-geo';
import Merge from "./vender/Merge";

// 绘制地图的类
class ThreeMap {
    constructor(config, geojson) {
        this.geojson = geojson;
        const defaultConfig = {
            background: "#11182f", // 2b3a65
            center: [103.754443, 30.544037], // 地图中心
            scale: 80, // 地图缩放
            translate: [0, 0], // 地图平移
            depth: 2, // 地图深度
            line: {
                color: '#5a77c5', // 轮廓线颜色
            },
            area: {
                color: '#344e85', // 区域颜色
                opacity: 0.7, // 透明度
                hover: true,
                hoverColor: '#5576bb', // 鼠标悬浮颜色
                upHover: false, // 悬浮凸起
                upHoverDepth: 2 // 凸起深度
            },
            controls: { // 控制器
                enableZoom: true, // 启用或禁用摄像机的缩放
                zoomSpeed: 1, // 缩放速度
                minDistance: 10, // 缩放最小
                maxDistance: 1000 // 缩放最大
            },
            camera: { // 相机
                position: [80, 5, 100], // x,y,z 对象三维坐标
                lookAt: [0, 0, 0], // x,y,z相机看的位置
                fov: 35, // 摄像机视锥体垂直视野角度
                near: 1, // 摄像机视锥体近端面
                far: 10000 // 摄像机视锥体远端面
            },
            text: { // 地名
                show: false,
                color: "#fff",
                fontSize: 12
            }
        };
        this.config = Merge(config, defaultConfig);
        this.vector3json = [];
        this.vector3Object = {};
        this.vector2json = [];
        this.domWidth = window.innerWidth;
        this.domHeight = window.innerHeight;
    }

    // init方法
    init(dom) {
        if (!dom) return;
        const width = dom.offsetWidth || 800;
        const height = dom.offsetHeight || 500;
        this.config.camera.aspect = width / height;
        this.domWidth = width;
        this.domHeight = height;
        this.dom = dom;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.background);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        dom.appendChild(this.renderer.domElement);

        // 设置相机
        this.setCamera();

        // 设置光
        this.setLight();

        // 设置坐标轴
        // this.setHelper();

        // 设置控制器
        this.setControl();

        // 绘制地图
        this.drawMap();

        // 添加事件
        if (this.config.area.hover) {
            this.addEvent();
        }

        // 设置动画
        this.animate();

        // 监听窗口变化
        this.resize = () => {
            if (this.dom) {
                const width = dom.offsetWidth || 800;
                const height = dom.offsetHeight || 500;
                this.config.camera.aspect = width / height;
                this.domWidth = width;
                this.domHeight = height;
                this.renderer.setSize(width, height);
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
            }
        }

        window.addEventListener("resize", this.resize);
    }

    // 绘制地图模型
    drawMap() {
        // 预处理数据
        this.vector3json = [];
        this.geojson.features.forEach(data => {
            let areas = data.geometry.coordinates[0]; // 多面坐标数组
            data.geometry.coordinates.forEach((item, i) => {
                if (i !== 0) {
                    areas = areas.concat(item);
                }
            });
            const vector3 = data.properties.center ? this.lnglatToVector3(data.properties.center) : [];
            const areasData = {
                ...data.properties,
                coordinates: [],
                vector3
            };
            areas.forEach((point, i) => {
                if (point[0] instanceof Array) {
                    areasData.coordinates[i] = [];
                    point.forEach(pointInner => {
                        areasData.coordinates[i].push(this.lnglatToVector3(pointInner));
                    });
                } else {
                    areasData.coordinates.push(this.lnglatToVector3(point));
                }
            });
            this.vector3Object[data.properties.name] = areasData;
            this.vector3json.push(areasData);

        });

        // 绘制模块
        const provincesgroup = new THREE.Group();
        const lineGroup = new THREE.Group();
        this.vector3json.forEach(provinces => {
            // 多面
            if (provinces.coordinates[0] instanceof Array) {
                provinces.coordinates.forEach(area => {
                    const mesh = this.getAreaMesh(area, provinces.name);
                    const line = this.getAreaLineMesh(area, provinces.name);
                    provincesgroup.add(mesh);
                    lineGroup.add(line);
                });
            } else { // 单面
                const mesh = this.getAreaMesh(provinces.coordinates, provinces.name);
                const line = this.getAreaLineMesh(provinces.coordinates, provinces.name);
                provincesgroup.add(mesh);
                lineGroup.add(line);
            }
        });
        lineGroup.position.z = this.config.depth;
        this.scene.add(provincesgroup);
        this.scene.add(lineGroup);

        this.lineGroup = lineGroup;
        this.provincesgroup = provincesgroup;
    }

    // 绘制area line
    getAreaLineMesh(points, name) {
        const material = new THREE.LineBasicMaterial({
            color: this.config.line.color
        });
        const geometry = new THREE.Geometry();
        geometry.vertices = [...points].map(d => new THREE.Vector3(...d));
        const line = new THREE.Line(geometry, material);
        line.userData.name = name;
        return line;
    }

    // 绘制area lines = [[x, y], [x1, y1]]
    getAreaMesh(points, name) {
        const shape = new THREE.Shape();

        points.forEach((p, i) => {
            const [x, y] = p;
            if (i === 0) {
                shape.moveTo(x, y);
            } else if (i === points.length - 1) {
                shape.quadraticCurveTo(x, y, x, y);
            } else {
                shape.lineTo(x, y);
            }
        });

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: this.config.depth,
            bevelEnabled: false
        });
        const material = new THREE.MeshBasicMaterial({
            color: this.config.area.color,
            transparent: true,
            opacity: this.config.area.opacity
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.name = name;

        return mesh;
    }

    // 鼠标效果
    updateMousemoveEffect() {
        // 通过摄像机和鼠标位置更新射线
        this.raycaster.setFromCamera(this.mouse, this.camera);
        // 计算物体和射线的焦点
        let intersects = this.raycaster.intersectObjects(this.provincesgroup.children);
        this.provincesgroup.children.forEach(mesh => {
            mesh.material.color.set(this.config.area.color);
            if (this.config.area.upHover) {
                mesh.position.setZ(0);
            }
        });
        if (this.config.area.upHover) {
            this.lineGroup.children.forEach(mesh => {
                mesh.position.setZ(0);
            });
        }
        let name = "";
        for (let i = 0; i < intersects.length; i++) {
            name = intersects[0].object.userData.name;
            this.provincesgroup.children.forEach(mesh => {
                if (mesh.userData.name === name) {
                    mesh.material.color.set(this.config.area.hoverColor);
                    if (this.config.area.upHover) {
                        mesh.position.setZ(this.config.area.upHoverDepth);
                    }
                }
            });
            if (this.config.area.upHover) {
                this.lineGroup.children.forEach(mesh => {
                    if (mesh.userData.name === name) {
                        mesh.position.setZ(this.config.area.upHoverDepth);
                    }
                });
            }
        }

        // 鼠标hover到区块，且外部调用mousemove事件
        if (intersects && intersects.length > 0 && this.hover) {
            if (this.oldName === name) return;
            this.oldName = name;
            const obj = this.vector2json.find(k => k.name === name); // 返回屏幕坐标和名称
            this.hover(obj);
        } else {
            this.oldName = null;
        }
    }

    // 添加事件
    addEvent() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.onMouseMove = (event) => {
            if (this.destroyFlag) return;
            this.mouseMove = true;
            // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
            this.domLeft = this.dom.getBoundingClientRect().left;
            this.domTop = this.dom.getBoundingClientRect().top;
            this.mouse.x = ((event.clientX - this.domLeft) / this.domWidth) * 2 - 1;
            this.mouse.y = - ((event.clientY - this.domTop) / this.domHeight) * 2 + 1;
        }

        window.addEventListener('mousemove', this.onMouseMove);
    }

    // vector3转换成绝对值坐标
    lnglatToVector2() {
        this.vector2json = [];
        this.vector3json.forEach(item => {
            if (item.name) { // 把九段线排除
                // const [x, y, z] = item.vector3;
                const [x, y, z] = this.lnglatToVector3(item.centroid || item.center);
                const vector3 = new THREE.Vector3(x, y, z);
                const pos = vector3.project(this.camera);
                const a = this.domWidth / 2;
                const b = this.domHeight / 2;
                const posX = Math.round(pos.x * a + a);
                const posY = Math.round(-pos.y * b + b);

                this.vector2json.push({
                    x: posX,
                    y: posY,
                    name: item.name
                });
            }
        });
    }

    // 添加文本
    addText() {
        if (this.dom && this.vector2json) {
            let canvas = document.querySelector('.wrap-area-name')
            if (!canvas) {
                canvas = document.createElement("canvas");
                canvas.className = "wrap-area-name";
                canvas.style = "position: absolute;left: 0;top:0;pointer-events: none";
                this.dom.appendChild(canvas);
            }
            canvas.width = this.domWidth;
            canvas.height = this.domHeight;
            const ctx = canvas.getContext('2d');
            const offCanvas = document.createElement('canvas')
            offCanvas.width = this.domWidth;
            offCanvas.height = this.domHeight;
            const ctxOffCanvas = canvas.getContext('2d');
            ctxOffCanvas.font = `${this.config.text.fontSize}px Arial`;
            ctxOffCanvas.fillStyle = this.config.text.color;
            // 可见元素集
            const texts = [];
            this.vector2json.forEach(item => {
                const { x: left, y: top, name } = item;
                const text = {
                    name,
                    left,
                    top,
                    width: ctxOffCanvas.measureText(name).width,
                    height: this.config.text.fontSize
                }
                let show = true
                for (let i = 0; i < texts.length; i++) {
                    if (
                        (text.left + text.width) < texts[i].left ||
                        (text.top + text.height) < texts[i].top ||
                        (texts[i].left + texts[i].width) < text.left ||
                        (texts[i].top + texts[i].height) < text.top
                    ) {
                        show = true
                    } else {
                        show = false
                        break
                    }
                }
                if (show) {
                    texts.push(text);
                    ctxOffCanvas.fillText(name, left, top); // 在画布上写文本
                }
            });

            ctx.drawImage(offCanvas, 0, 0);
        }
    }

    /**
     * 经纬度转换成vector3
     * @param {Array} lnglat [x, y] 
     */
    lnglatToVector3(lnglat) {
        if (!this.projection) {
            this.projection = d3Geo
                .geoMercator()
                .center(this.config.center)
                .scale(this.config.scale)
                .translate(this.config.translate);
        }
        const [x, y] = this.projection([...lnglat]);
        const z = 0;
        return [y, x, z];
    }

    // 设置相机
    setCamera() {
        const { fov, aspect, near, far, position } = this.config.camera;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.up.x = 0;
        this.camera.up.y = 0;
        this.camera.up.z = 1;
        const [x, y, z] = position;
        this.camera.position.set(x, y, z);
        const [x1, y1, z1] = this.config.camera.lookAt;
        this.camera.lookAt(x1, y1, z1);
        this.scene.add(this.camera);
    }

    // 设置光
    setLight() {
        const light = new THREE.AmbientLight(0x404040); // soft white light
        this.scene.add(light);
    }

    // 设置坐标轴
    setHelper() {
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }

    // 设置动画
    animate() {
        if (this.destroyFlag) return;
        requestAnimationFrame(this.animate.bind(this));
        if (this.config.area.hover && this.mouseMove) {
            this.updateMousemoveEffect();
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        // vector3转屏幕坐标
        this.lnglatToVector2();

        // 添加文本
        if (this.config.text.show) {
            this.addText();
        }
    }

    // 设置控制器
    setControl() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.zoomSpeed = this.config.controls.zoomSpeed;
        this.controls.enableDamping = true;
        this.controls.enableZoom = this.config.controls.enableZoom;
        this.controls.minDistance = this.config.controls.minDistance;
        this.controls.maxDistance = this.config.controls.maxDistance;
        // this.scene.add(this.controls);
    }

    // 销毁
    destroy() {
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("resize", this.resize);
        this.destroyFlag = true;
        this.lineGroup.children.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.provincesgroup.children.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.renderer.dispose();
        this.controls.dispose();
        this.scene.dispose();

        this.renderer = null;
        this.controls = null;
        this.scene = null;

        this.geojson = [];
        this.vector3json = [];
        this.vector3Object = {};
        this.vector2json = [];
        this.dom = null;
        this.lineGroup = null;
        this.provincesgroup = null;
        this.projection = null;
    }
}

export default ThreeMap;
