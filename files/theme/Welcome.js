// Place Contents Herevar i = 0;
var txt = 'Q4Life is the World’s leading socio-economic village for better-best quality of life, with borderless markets, and boundless technologies. At Q4Life, every client is a service provider and every service provider is a client.'; /* The text */
var speed = 50; /* The speed/duration of the effect in milliseconds */

function typeWriter() {
  if (i < txt.length) {
    document.getElementById("demo1”).innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}