var active = 0;
for (var i = 0; i < document.links.length; i++) {
  if (document.links[i].href === document.URL) {
    active = i;
  }
}
// document.links[active].className = 'active';

console.log(window.location.pathname);
