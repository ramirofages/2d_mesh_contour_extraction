import {Vector2} from 'three';
import {Vector3} from 'three';
import {Color} from 'three';
import {Debug} from 'ohzi-core';
export default class EdgeLoop
{
  constructor(edges, length)
  {
    this.raw_edges = [];
    this.edges = [];

    for(let i=0; i<edges.length; i++)
    {
      let e = edges[i];
      this.raw_edges.push({
        from: e.from.clone(),
        to: e.to.clone()
      })
      this.edges.push({
        from: e.from.clone(),
        to: e.to.clone()
      })
    }
    this.length = length;

    if(length === undefined)
    {
      let length = 0;
      for(let i=0; i< edges.length; i++)
      {
        length += edges[i].from.distanceTo(edges[i].to);
      }
      this.length = length;
    }
  }

  make_CCW()
  {
    if(this.is_CCW())
      return;

    this.revert_winding();
    
  }
  make_CW()
  {
    if(this.is_CCW())
      this.revert_winding();
  }

  revert_winding()
  {
    let new_edges = [];
    for(let i = this.edges.length; i > 0; i--)
    {
      let e = this.edges[i-1];
      new_edges.push({
        from: e.to.clone(),
        to: e.from.clone()
      })
    }
    this.edges = new_edges;
  }
  is_CCW()
  {
    let edges = this.edges;

    let n0 = edges[0].to.clone().sub(edges[0].from).normalize();
    let n1 = edges[1].to.clone().sub(edges[0].from).normalize();

    let i=1;
    while(i < edges.length && n0.dot(n1) > 0.99999)
    {
      i++;
      n1 = edges[i].to.clone().sub(edges[0].from).normalize();
    }
    return this._is_ccw(edges[0].from, edges[0].to, edges[i].to) > 0;
  }

  _is_ccw(a,b,c) {
     return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
  }

  shrink_away_from_loops(offset = 0, loops = [])
  {
    let edges = this.edges;

    for(let i=0; i < edges.length; i++)
    {
      let e = edges[i];
      let is_close_to_neighboor = this.is_edge_close_to_neighboors(e, loops)
      let n0 = e.to.clone().sub(e.from).normalize().multiplyScalar(offset);
      n0.set(-n0.y, n0.x); // pointing inwards

      if(is_close_to_neighboor === true)
      {
        e.from.add(n0);
        e.to.add(n0);
      }

    }

    for(let i=0; i < edges.length; i++)
    {
      let e = edges[i];
      let e_next = undefined;

      if(i === edges.length-1)
      {
        e_next = edges[0];
      }
      else
      {
        e_next = edges[i+1];
      }

      let result = this.intersect_lines(e.from, e.to, e_next.from, e_next.to);
      if(result)
      {
        e.to.set(result.x, result.y);
        e_next.from.set(result.x, result.y);
      }
    }
  }

  is_edge_close_to_neighboors(edge, neighbour_loops)
  {
    for(let i=0; i< neighbour_loops.length; i++)
    {
      let n = neighbour_loops[i];
      if(n !== this && this.is_edge_close_to_neighboor(edge, n.raw_edges))
        return true;
    }
    return false;
  }

  is_edge_close_to_neighboor(edge, neighbourboor_edges)
  {
    let normal = edge.to.clone().sub(edge.from).normalize().multiplyScalar(0.05);
    normal.set(normal.y, -normal.x);

    let edge_normal = {
      from: edge.to.clone().sub(edge.from).multiplyScalar(0.5).add(edge.from).sub(normal.clone().multiplyScalar(0.5)),
      to:   edge.to.clone().sub(edge.from).multiplyScalar(0.5).add(edge.from).add(normal.clone().multiplyScalar(0.5))
    }
    

    for(let i=0; i< neighbourboor_edges.length; i++)
    {
      let n_e = neighbourboor_edges[i];
      let result = this.intersect_lines( edge_normal.from, 
                                         edge_normal.to, 
                                          n_e.from, 
                                          n_e.to);
      if( result !== undefined )
      {

        let edge_center = edge_normal.to.clone().sub(edge_normal.from).multiplyScalar(0.5).add(edge_normal.from);
        let edge_length = edge_normal.to.clone().sub(edge_normal.from).length();

        let n_e_center        = n_e.to.clone().sub(n_e.from).multiplyScalar(0.5).add(n_e.from);
        let n_e_center_length = n_e.to.clone().sub(n_e.from).length();

        let is_contained_in_edge = result.clone().sub(edge_center).length() <= edge_length*0.5+0.0001;
        let is_contained_in_n_e = result.clone().sub(n_e_center).length() <= n_e_center_length*0.5+0.0001;

        if(is_contained_in_n_e === true && is_contained_in_edge === true)
        {
          // Debug.draw_line([new Vector3(edge_normal.from.x, 0.1, edge_normal.from.y), 
          //            new Vector3(edge_normal.to.x, 0.1, edge_normal.to.y)], "#00FF00");
          return true;

        }
        // else
        // {
        //   Debug.draw_line([new Vector3(edge_normal.from.x, 0, edge_normal.from.y), 
        //              new Vector3(edge_normal.to.x, 0, edge_normal.to.y)]);
        //   return false;

        // }

      }
    }

    return false;

  }



  intersect_lines(p1a, p1b, p2a, p2b) {
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

  draw(as_arrows = false)
  {
    for(let i=0; i< this.edges.length; i++)
    {
      let edge = this.edges[i];
      let c = new Color("#000000");
      c.r = i/(this.edges.length);
      let from = new Vector3(edge.from.x, 0 ,edge.from.y);
      let to = new Vector3(edge.to.x, 0 ,edge.to.y);
      if(as_arrows)
        Debug.draw_arrow(from, to.clone().sub(from).normalize(), "#"+c.getHexString());
      else
        Debug.draw_line([from, to], "#FF0000");
    }
  }

}