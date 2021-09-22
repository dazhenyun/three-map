import * as THREE from 'three';
import throttle from "lodash.throttle";

// 地图上飞线组件
class Line {
    constructor(config, data) {
        this.config = {
            lineCount: 20, // 数值越高线月平滑,值越高速度越慢
            height: 15, // 抛物线最高点
            depth: 2, // 地图深度
            color: "#759fb3", // 线颜色
            animateColor: "#fff", // 动画线颜色
            ...config
        };
        this.colorIndex = 0;
        this.data = data;
        this.drawFlyLine();
        setTimeout(() => { this.animate() }, 100);
    }

    // 绘制抛物线
    drawFlyLine() {
        const group = new THREE.Group();
        this.data.forEach(d => {
            const { source, target } = d;
            const [x0, y0, z0] = source.center;
            const [x1, y1, z1] = target.center;

            const curve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(x0, y0, z0 + this.config.depth),
                new THREE.Vector3((x0 + x1) / 2, (y0 + y1) / 2, this.config.height),
                new THREE.Vector3(x1, y1, z1 + this.config.depth)
            );
            const points = curve.getPoints(this.config.lineCount);
            const geometry = new THREE.Geometry();
            geometry.vertices = points;
            geometry.colors = new Array(points.length).fill(new THREE.Color(this.config.color));
            const material = new THREE.LineBasicMaterial({
                vertexColors: THREE.VertexColors,
                // transparent: true,
                // side: THREE.DoubleSide
            });
            const line = new THREE.Line(geometry, material);

            group.add(line);
        });
        this.group = group;
    }

    animate() {
        if (this.destroyFlag) return;
        requestAnimationFrame(this.animate.bind(this));
        if (this.group) {
            this.rewriteAnimate();
        }
    }

    // 重写动画
    rewriteAnimate = throttle(() => {
        if (this.group) {
            this.group.children.forEach(mesh => {
                mesh.geometry.colors = new Array(this.config.lineCount).fill(1).map((d, i) => {
                    if (i === this.colorIndex) {
                        return new THREE.Color(this.config.animateColor);
                    } else {
                        return new THREE.Color(this.config.color);
                    }
                });
                mesh.geometry.colorsNeedUpdate = true;
            });
            this.colorIndex++;

            if (this.colorIndex >= this.config.lineCount) {
                this.colorIndex = 0;
            }
        }
    }, 100);

    // 销毁
    destroy() {
        this.destroyFlag = true;
        this.data = null;
        this.colorIndex = 0;
        this.group.children.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.group = null;
    }

}

export default Line;
