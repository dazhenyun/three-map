import * as THREE from 'three';

// 地图上柱子组件
class Bar {
    constructor(config, data) {
        this.config = {
            depth: 2, // 地图深度
            texture: "", // 柱子贴图
            color: "#fff", // 柱子颜色
            radiusTop: 0.1, // 圆柱的顶部半径
            radiusBottom: 0.4, // 圆柱的底部半径
            radialSegments: 32, // 几边形
            ...config
        };
        this.data = data;
        this.drawBar();
    }

    // 绘制柱子
    drawBar() {
        const group = new THREE.Group();
        const texture = this.config.texture ? new THREE.TextureLoader().load(this.config.texture) : null;
        this.data.forEach(d => {
            const [x, y, z] = d.center;
            //创建圆柱体
            const cylinderGeo = new THREE.CylinderGeometry(this.config.radiusTop, this.config.radiusBottom, d.value / 10, this.config.radialSegments);
            const cylinderMat = new THREE.MeshBasicMaterial({//创建材料
                map: texture,
                color: this.config.color,
                transparent: true,
                depthTest: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            //创建圆柱体网格模型
            const cylinderMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
            cylinderMesh.position.set(x, y, z + d.value / 10 / 2 + this.config.depth);//设置圆柱坐标
            cylinderMesh.rotation.x = Math.PI / 2;
            group.add(cylinderMesh);
        });
        this.group = group;
    }

    // 销毁
    destroy() {
        this.data = null;
        this.group.children.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.group = null;
    }

}

export default Bar;
