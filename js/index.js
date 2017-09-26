(function() {
  var menuBtn = document.querySelector('.menu-open');
  var nav = document.querySelector('.nav-primary');
  menuBtn.addEventListener('click', function(event) {
    nav.classList.toggle('active-menu');
  });
})();
