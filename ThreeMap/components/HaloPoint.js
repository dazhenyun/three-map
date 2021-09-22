import * as THREE from 'three';
import throttle from "lodash.throttle";
import { accAdd, accSub } from "@tntd/utils";

// 地图上光晕点组件
class HaloPoint {
    constructor(config, data) {
        this.config = {
            depth: 2, // 地图深度
            baseColor: "#fff", // 底座样色
            polygon: 6, // 底座多边形
            polygonSize: 0.5, // 底座多边形大小
            baseLineColor: "#fff", // 光晕线颜色
            ...config
        };
        this.data = data;
        this.scale = 1;
        this.drawBar();
        this.animate();
    }

    // 添加底座
    addBase(p) {
        const geometry = new THREE.CircleGeometry(this.config.polygonSize, this.config.polygon);
        const material = new THREE.MeshBasicMaterial({ color: this.config.baseColor });
        const circle = new THREE.Mesh(geometry, material);
        const [x, y, z] = p;
        circle.position.set(x, y, z + this.config.depth + 0.1);
        return circle;
    }

    // 底座光晕
    addBaseLine(p) {
        const material = new THREE.LineBasicMaterial({
            color: this.config.baseLineColor,
            transparent: true,
            opacity: 1,
            depthTest: false,
            side: THREE.DoubleSide
        });
        const geometry = new THREE.CircleGeometry(this.config.polygonSize, this.config.polygon);
        const [a, ...points] = geometry.vertices;
        geometry.vertices = [...points, points[0]];
        geometry.vertices.push(geometry);

        const line = new THREE.Line(geometry, material);
        const [x, y, z] = p;
        line.position.set(x, y, z + this.config.depth + 0.1);
        line.scale.set(2, 2, 2);
        return line;
    }

    // 底座光晕动画
    animate() {
        if (this.destroyFlag) return;
        requestAnimationFrame(this.animate.bind(this));
        if (this.group) {
            this.rewriteAnimate();
        }
    }
    rewriteAnimate = throttle(() => {
        if (this.group) {
            this.group.children.forEach(mesh => {
                if (mesh.type === "Line") {
                    mesh.scale.set(this.scale, this.scale, this.scale);
                    const opacity = accSub(2, this.scale);
                    mesh.material.opacity = opacity;
                }
            });

            this.scale = accAdd(this.scale, 0.1);

            if (this.scale >= 2) {
                this.scale = 1;
            }
        }
    }, 100);

    // 绘制光晕点
    drawBar() {
        const group = new THREE.Group();
        this.data.forEach(d => {
            const [x, y, z] = d.center;
            group.add(this.addBase([x, y, z]));
            group.add(this.addBaseLine([x, y, z]));
        });
        this.group = group;
    }

    // 销毁
    destroy() {
        this.destroyFlag = true;
        this.data = null;
        this.scale = 1;
        this.group.children.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.group = null;
    }

}

export default HaloPoint;
