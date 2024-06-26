import { gravity, horizontalFriction, verticalFriction } from "../Constants";
import { obstacle, Sink } from "../Objects";  //This contains the obstacle and sink values
import { pad, unpad } from "../Padding";

export class Ball {
    private x: number;
    private y: number;
    private radius: number;
    private color: string;
    private vx: number;
    private vy: number;
    private ctx: CanvasRenderingContext2D;
    private obstacles: obstacle[]
    private sinks: Sink[]
    private onFinish: (index: number) => void;
    private triggerSinkEffect():void{
        const audio = new Audio('/win.wav');
        audio.play();
    }

    constructor(x: number, y: number, radius: number, color: string, ctx: CanvasRenderingContext2D, obstacles: obstacle[], sinks: Sink[], onFinish: (index: number) => void) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.vx = 0;
      this.vy = 0;
      this.ctx = ctx;
      this.obstacles = obstacles;
      this.sinks = sinks;
      this.onFinish = onFinish;
    }
  
    draw() {
      this.ctx.beginPath();
      this.ctx.arc(unpad(this.x), unpad(this.y), this.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.color;
      this.ctx.fill();
      this.ctx.closePath();
    }
  
    update() {  //Game Loop 
      this.vy += gravity;
      // Change the position
      this.x += this.vx;
      this.y += this.vy;
  
      // Collision with obstacles
      this.obstacles.forEach(obstacle => { //It iterartes over all the obstacles and check colllision
        const dist = Math.hypot(this.x - obstacle.x, this.y - obstacle.y); //find dist b/w center of ball and center of obstacles.
        if (dist < pad(this.radius + obstacle.radius)) { //This means collison happen
          // Calculate collision angle
          const angle = Math.atan2(this.y - obstacle.y, this.x - obstacle.x);
          // console.log(angle);
          // Reflect velocity
          const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          this.vx =(Math.cos(angle) * speed * horizontalFriction);
          this.vy = Math.sin(angle) * speed * verticalFriction;
  
          // Adjust position to prevent sticking
          const overlap = this.radius + obstacle.radius - unpad(dist);
          this.x += pad(Math.cos(angle) * overlap);
          this.y += pad(Math.sin(angle) * overlap);
        }
      });
  
      // Collision with sinks
      for (let i = 0; i < this.sinks.length; i++) {
        const sink = this.sinks[i];
        if (
            unpad(this.x) > sink.x - sink.width / 2 &&
            unpad(this.x) < sink.x + sink.width / 2 &&
            (unpad(this.y) + this.radius) > (sink.y - sink.height / 2)
        ) { //if collision occurs than do this.
            this.vx = 0;
            this.vy = 0;
            this.onFinish(i);
            this.triggerSinkEffect(); 
            break;
        }
      }
    }
  
  }