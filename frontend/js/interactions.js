var page_height = window.innerHeight;
var center_piece_offset = page_height * 0.5;

var onScrollHandler = function () {

    let img_id = ((document.documentElement.scrollTop - center_piece_offset) / 5 + 1).toFixed(0);

    if (img_id < 1) {
        document.getElementById("center_piece").setAttribute("src", "assets/seq/Frame_00001.png");
    } else if (img_id > 50) {
        document.getElementById("center_piece").setAttribute("src", "assets/seq/Frame_00050.png");
    } else {
        if (img_id < 10) {
            img_id = "assets/seq/Frame_0000" + img_id.toString() + ".png";
        } else {
            img_id = "assets/seq/Frame_000" + img_id.toString() + ".png";
        }
        document.getElementById("center_piece").setAttribute("src", img_id);
    };

    let img_opacity = 1 - (document.documentElement.scrollTop - page_height) / 200;
    if (img_opacity > 1) {
        document.getElementById("center_piece").style.opacity = 1;
        document.getElementById("center_piece").style.display = "block";
    } else if (img_opacity < 0) {
        document.getElementById("center_piece").style.opacity = 0;
        document.getElementById("center_piece").style.display = "none";
    } else {
        document.getElementById("center_piece").style.opacity = img_opacity;
        document.getElementById("center_piece").style.display = "block";
    };
};

window.addEventListener("scroll", onScrollHandler);

function randomizecolor() {

    let random_num = document.documentElement.dataset.theme || 1;
    while (random_num == document.documentElement.dataset.theme) {
        random_num = Math.floor(Math.random() * 4) + 1;
    };
    
    document.documentElement.setAttribute("data-theme", random_num);
}

var rellax = new Rellax('.rellax');

AOS.init({
    offset: 150,
    easing: 'ease-in-quart',
    duration: 500,
});

randomizecolor();
