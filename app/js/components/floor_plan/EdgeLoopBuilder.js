import {Vector2, Vector3} from 'three';
import EdgeLoop from './EdgeLoop';

export default class EdgeLoopBuilder
{
  constructor()
  {

  }
  
  get_loops_from_points(points)
  {
    let is_closed = false;
    if(points[0].distanceTo(points[points.length-1]) < 0.00001)
    {
      is_closed = true;
    }

    let edges = [];

    for(let i=0; i< points.length-1; i++)
    {
      let p0 = points[i];
      let p1 = points[i+1];
      edges.push({
        from: p0.clone(),
        to: p1.clone()
      });
    }
    if(is_closed === false)
    {
      edges.push({
        from: points[points.length-1],
        to: points[0]
      })
    }
    return this.build_loops_from_edges(edges);
  }

  get_loops_from_point_pair_array(point_pairs)
  {
    let edges = [];
    for(let i=0; i< point_pairs.length/3; i+= 2)
    {
      let p0 = new Vector3();
      p0.x = point_pairs[i*3+0];
      p0.y = point_pairs[i*3+1];
      p0.z = point_pairs[i*3+2];

      let p1 = new Vector3();
      p1.x = point_pairs[i*3+3];
      p1.y = point_pairs[i*3+4];
      p1.z = point_pairs[i*3+5];

      edges.push({
        from: new Vector2(p0.x, p0.z),
        to: new Vector2(p1.x, p1.z)
      })
    }

    return this.build_loops_from_edges(edges);
  }


  build_loops_from_edges(raw_edges)
  {
    let edges = [...raw_edges];

    let edge_loops = [];


    
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

      let c = center.clone().multiplyScalar(1/sorted_edges.length)
      if(sorted_edges.length > 1)
        edge_loops.push(new EdgeLoop(sorted_edges, accumulated_length, c));
    }

    edge_loops.sort((a,b)=>{
      return b.length - a.length;
    })

    for(let i=0; i< edge_loops.length; i++)
    {
      if(i===0)
        edge_loops[i].make_CCW();
      else
        edge_loops[i].make_CW();
    }

    return edge_loops;
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
}