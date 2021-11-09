export default class Splitter
{
  constructor(contour)
  {
    this.contour = contour;
  }

  split(point_a, point_b)
  {

    return this.contour.split(point_a, point_b);
  }
}