import {EdgesGeometry, Shape, ExtrudeGeometry} from 'three'
import {MeshBasicMaterial, Mesh, Vector3, Vector2} from 'three'
import {MeshLambertMaterial} from 'three'
import {Color} from 'three'
import {Path} from 'three'
import {Debug} from 'ohzi-core'

export default class MeshContour
{
  constructor(mesh)
  {
    this.material = mesh.material;
    const edges_geo = new EdgesGeometry( mesh.geometry );
    let points = edges_geo.attributes.position.array;

    mesh.geometry.computeBoundingBox()
    this.bounding_box = mesh.geometry.boundingBox.clone();

    let edges = [];

    for(let i=0; i< points.length/3; i+= 2)
    {
      let p0 = new Vector3();
      p0.x = points[i*3+0];
      p0.y = points[i*3+1];
      p0.z = points[i*3+2];

      let p1 = new Vector3();
      p1.x = points[i*3+3];
      p1.y = points[i*3+4];
      p1.z = points[i*3+5];

      edges.push({
        from: new Vector2(p0.x, p0.z),
        to: new Vector2(p1.x, p1.z)
      })
    }
    // edges = [
    //   {
    //     from: new Vector2(0,0),
    //     to: new Vector2(1,0)
    //   },
    //   {
    //     from: new Vector2(1,0),
    //     to: new Vector2(1,1)
    //   },

    //   {
    //     from: new Vector2(1,1),
    //     to: new Vector2(0,1)
    //   },
    //   {
    //     from: new Vector2(0,1),
    //     to: new Vector2(0,0)
    //   }
    // ]
    this.edges = edges;


  }

  scale(value)
  {

  }


  get_contour_groups(raw_edges)
  {
    let edges = [...raw_edges];

    let edge_groups = [];

    

    
    while(edges.length > 0)
    {
      let sorted_edges = [];
      sorted_edges.push(edges.shift())

      let target_pos = sorted_edges[0].to
      let index = this.get_target_edge_index(target_pos, edges);

      let accumulated_length = sorted_edges[0].from.distanceTo(sorted_edges[0].to);

      let center = new Vector2();

      while(index !== undefined && edges.length > 0)
      {
        center.add(edges[index].from);

        accumulated_length += edges[index].from.distanceTo(edges[index].to);
        sorted_edges.push(edges[index]);
        edges.splice(index, 1);

        target_pos = sorted_edges[sorted_edges.length-1].to
        index = this.get_target_edge_index(target_pos, edges);
      }

      edge_groups.push({
        length: accumulated_length,
        edges: sorted_edges,
        center: center.multiplyScalar(1/sorted_edges.length)
      });

    }

    edge_groups.sort((a,b)=>{
      return b.length - a.length;
    })

    return edge_groups;
  }

  get_extruded_mesh(depth = 1, scale_offset = 0)
  {
    let extrudeSettings = {
      steps: 1,
      depth: depth,
      bevelEnabled: false
    };
    let geometry = new ExtrudeGeometry( this.get_shape(scale_offset), extrudeSettings );
    geometry.rotateX(Math.PI/2)
    geometry.translate(0, depth, 0);
    // geometry.translate(0, depth + this.bounding_box.min.y, 0);

    let mat = new MeshLambertMaterial({color: "#FF0000"})
    mat.color = this.material.color;

    let material = new MeshBasicMaterial( { color: 0x00ff00 } );
    return new Mesh( geometry, mat ) ;
  
  }

  get_shape(offset_scale = 0)
  {
    let sorted_edge_groups = this.get_contour_groups(this.edges);
    this.apply_scale_to_contour_groups(sorted_edge_groups, offset_scale);
    let sorted_edges = sorted_edge_groups[0].edges;
    let shape = new Shape();

    let edge = sorted_edges[0];
    shape.moveTo( edge.from.x, edge.from.y );
    shape.lineTo( edge.to.x, edge.to.y );
    
    for(let i = 1; i < sorted_edges.length; i++)
    {
      let edge = sorted_edges[i];
      shape.lineTo( edge.to.x, edge.to.y );
    }

    let holes = [];
    for(let i = 1; i< sorted_edge_groups.length; i++)
    {
      let hole_shape = new Shape();
      let edges = sorted_edge_groups[i].edges; 

      let edge = edges[edges.length-1];
      hole_shape.moveTo(edge.to.x, edge.to.y);
      hole_shape.lineTo(edge.from.x, edge.from.y);

      for(let j = edges.length-2; j > 0 ; j--)
      {
        let edge = edges[j];
        hole_shape.lineTo(edge.from.x, edge.from.y);
      }
      holes.push(hole_shape);
    }

    shape.holes = holes;
    return shape;
  }

  apply_scale_to_contour_groups(contour_groups, offset_scale=0)
  {

    for(let i=0; i< contour_groups.length; i++)
    {
      let edges = contour_groups[i].edges;
      let new_edges = [];
      for(let j=0; j < edges.length; j++)
      {
        let e0 = edges[j];
        let e_next = undefined;
        let e_prev = undefined;
        // console.log("--------"+j+"-------")

        if(j === edges.length-1)
        {
          // console.log("next - primer edge");
          e_next = edges[0];
        }
        else
        {
          // console.log("next - siguiente edge");
          e_next = edges[j+1];
        }

        if(j === 0)
        {
          // console.log("prev - ultimo edge");
          e_prev = edges[edges.length-1];
        }
        else
        {
          // console.log("prev - anterior edge");
          e_prev = edges[j-1];
        }
        // console.log("----------------------")
        let n0 = e0.to.clone().sub(e0.from).normalize();
        n0.set(n0.y, -n0.x);

        let n_next = e_next.to.clone().sub(e_next.from).normalize();
        n_next.set(n_next.y, -n_next.x);

        let n_prev = e_prev.to.clone().sub(e_prev.from).normalize();
        n_prev.set(n_prev.y, -n_prev.x);

        let n_avg_next = n0.clone().add(n_next).multiplyScalar(0.5);
        let n_avg_prev = n0.clone().add(n_prev).multiplyScalar(0.5);

        new_edges.push({
          from: e0.from.clone().add(n_avg_prev.multiplyScalar(offset_scale)),
          to: e0.to.clone().add(n_avg_next.multiplyScalar(offset_scale))
        })
        // e0.from.add(n_avg_prev.multiplyScalar(offset_scale))
        // e0.to.add(n_avg_next.multiplyScalar(offset_scale))
      }
      contour_groups[i].edges = new_edges;
    }
  }

  get_target_edge_index(target_position, edges)
  {
    for(let i=0; i< edges.length; i++)
    {
      let current_edge = edges[i];

      if(target_position.distanceToSquared(current_edge.from) < 0.0001*0.0001)
      {
        return i;
      }
    }
    return undefined;
  }

  show_contour()
  {
    let contour_groups = this.get_contour_groups(this.edges);
    // this.apply_scale_to_contour_groups(contour_groups, 0.2);
    let sorted_edges = contour_groups[0].edges;
    // console.log(sorted_edges)
    for(let i=0; i< sorted_edges.length; i++)
    {
      let edge = sorted_edges[i];
      let c = new Color("#000000");
      c.r = i/(sorted_edges.length);
      let from = new Vector3(edge.from.x, 0 ,edge.from.y);
      let to = new Vector3(edge.to.x, 0 ,edge.to.y);
      // Debug.draw_arrow(from, to.clone().sub(from).normalize(), "#"+c.getHexString());
      Debug.draw_sphere(from, 0.05, "#"+c.getHexString());
    }
  }

  intersects_line(p0_2D, p1_2D)
  {

    for(let i=0; i< sorted_edges.length; i++)
    {
      let edge = sorted_edges[i];

      let inter = this._intersect2d(edge.from, edge.to, p0_2D, p1_2D)
      if(inter)
      {
        console.log(edge, edge.from, edge.to, p0_2D, p1_2D)
        return inter;
      }
    }

    return undefined;
  }

  _intersect2d (p1a, p1b, p2a, p2b) {
    const o1 = new Vector2(p1a.x, p1a.y);
    const o2 = new Vector2(p2a.x, p2a.y);
    const d1 = o1.clone().sub(new Vector2(p1b.x, p1b.y));
    const d2 = o2.clone().sub(new Vector2(p2b.x, p2b.y));

    const det = (d1.x * d2.y - d2.x * d1.y)
    if ( Math.abs(det) < 1e-12 ) {
      return undefined
    }
    const d20o11 = d2.x * o1.y
    const d21o10 = d2.y * o1.x
    const d20o21 = d2.x * o2.y
    const d21o20 = d2.y * o2.x
    const t = (((d20o11 - d21o10) - d20o21) + d21o20)/ det;
    let result = o1.add(d1.multiplyScalar(t)); //(d1 * t) + 
    return new Vector2(result.x, result.y);
  }
}