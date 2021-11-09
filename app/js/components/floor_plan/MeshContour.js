import {EdgesGeometry, Shape, ExtrudeGeometry} from 'three'
import {MeshBasicMaterial, Mesh, Vector3, Vector2} from 'three'
import {MeshLambertMaterial} from 'three'
import {Color} from 'three'
import {Path} from 'three'
import {Box3} from 'three'
import {Debug} from 'ohzi-core'
import EdgeLoopBuilder from './EdgeLoopBuilder';

export default class MeshContour
{
  constructor(mesh)
  {
    this.name          = "";
    this.material      = undefined;
    this.original_mesh = undefined;

    this.bounding_box = new Box3();

    this.edge_loops = [];

    if(mesh)
    {
      this.set_from_mesh(mesh);
    }
  }

  reset()
  {
    for (let i = 0; i < this.edge_loops.length; i++) {
      this.edge_loops[i].reset();
    }
  }

  set_from_mesh(mesh)
  {
    this.name          = mesh.name;
    this.material      = mesh.material;
    this.original_mesh = mesh;
    const edges_geo    = new EdgesGeometry( mesh.geometry );
    let points         = edges_geo.attributes.position.array;

    mesh.geometry.computeBoundingBox()
    this.bounding_box = mesh.geometry.boundingBox.clone();

    let edge_loop_builder = new EdgeLoopBuilder();
    this.edge_loops = edge_loop_builder.get_loops_from_point_pair_array(points);
  }

  shrink_away_from_contours(offset_scale = 0, contours = [])
  {
    let contour_loops = [];

    for(let i=0; i< contours.length; i++)
    {
      if(contours[i] !== this)
      {
        contour_loops.push(contours[i].edge_loops[0])
      }
    }

    this.shrink_away_from_contour_loops(offset_scale, contour_loops)
  }

  shrink_away_from_contour_loops(offset_scale = 0, contour_loops = [])
  {
    this.edge_loops[0].shrink_away_from_loops(offset_scale, contour_loops);
  }

  get_extruded_mesh(depth = 1)
  {
    let extrudeSettings = {
      steps: 1,
      depth: depth,
      bevelEnabled: false
    };
    let geometry = new ExtrudeGeometry( this.get_shape(), extrudeSettings );
    geometry.rotateX(Math.PI/2)
    // geometry.translate(0, depth, 0);
    geometry.translate(0, depth + this.bounding_box.min.y, 0);

    let mat = new MeshLambertMaterial({color: "#FF0000"})
    mat.color = this.material.color;

    let material = new MeshBasicMaterial( { color: 0x00ff00 } );

    let mesh = new Mesh( geometry, mat );
    mesh.name = this.name;
    return mesh;
  }

  get_shape()
  {
    let sorted_edge_loops = this.edge_loops;

    let sorted_edges = sorted_edge_loops[0].edges;
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
    for(let i = 1; i< sorted_edge_loops.length; i++)
    {
      let hole_shape = new Shape();
      let edges = sorted_edge_loops[i].edges; 

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

  clone()
  {
    let contour = new MeshContour();
    contour.name = this.name;
    contour.material = this.material;
    contour.original_mesh = this.original_mesh;
    contour.bounding_box = this.bounding_box.clone()

    let edge_loops = [];
    for(let i=0; i< this.edge_loops.length; i++)
    {
      edge_loops.push(this.edge_loops[i].clone());
    }
    return contour;
  }
}