var page_height = window.innerHeight;
var stoppingpoint = document.getElementById("samples").offsetTop + page_height / 2;

var onScrollHandler = function () {

    if (document.documentElement.scrollTop < 1290 && document.getElementById("center_piece_container").style.right !== "5vw") {
        document.getElementById("center_piece_container").style.right = "5vw";
        document.getElementById("center_piece_container").style.left = "55vw";
    }

    if (document.documentElement.scrollTop >= 1290 && document.getElementById("center_piece_container").style.right !== "30vw") {
        document.getElementById("center_piece_container").style.right = "30vw";
        document.getElementById("center_piece_container").style.left = "30vw";
    }

    let img_id = (document.documentElement.scrollTop / 10).toFixed(0);

//    console.log(img_id);

    if (img_id < 1) {
        document.getElementById("center_piece").setAttribute("src", "assets/seq/cut/Frame_00000 copy.png");
    } else if (img_id <= 99) {
        if (img_id < 10) {
            img_id = "assets/seq/cut/Frame_0000" + img_id.toString() + " copy.png";
        } else {
            img_id = "assets/seq/cut/Frame_000" + img_id.toString() + " copy.png";
        };
        document.getElementById("center_piece").setAttribute("src", img_id);

    } else {
        if (img_id % 100 < 10) {
            img_id = "assets/seq/nocut/Frame_0000" + (img_id % 100).toString() + " copy.png";
        } else {
            img_id = "assets/seq/nocut/Frame_000" + (img_id % 100).toString() + " copy.png";
        };

        document.getElementById("center_piece").setAttribute("src", img_id);

    };

    let img_opacity = -(1 - (-(document.documentElement.scrollTop - stoppingpoint) - page_height) / 50);

    if (img_opacity > 1) {
        //        document.getElementById("center_piece_container").style.width = "50vw";
        document.getElementById("center_piece_container").style.opacity = 1;
        document.getElementById("center_piece_container").style.display = "flex";
    } else if (img_opacity < 0) {
        //        document.getElementById("center_piece_container").style.width = 0;
        document.getElementById("center_piece_container").style.opacity = 0;
        document.getElementById("center_piece_container").style.display = "none";
    } else {
        //        document.getElementById("center_piece_container").style.width = (50 * img_opacity) + "vw";
        document.getElementById("center_piece_container").style.opacity = img_opacity;
        document.getElementById("center_piece_container").style.display = "flex";
    };

};

function findcurrent(){
    console.log("deprecated function")
}


function preload() {
    for (i = 0; i < 99; i++) {
        let pre = document.createElement("link");
        pre.setAttribute("rel", "prefetch");
        if (i < 1) {
            pre.setAttribute("href", "assets/seq/cut/Frame_00000 copy.png");
            document.head.appendChild(pre);
            pre.setAttribute("href", "assets/seq/nocut/Frame_00000 copy.png");
            document.head.appendChild(pre);
        } else if (i < 10) {
            pre.setAttribute("href", "assets/seq/cut/Frame_0000" + i + " copy.png");
            document.head.appendChild(pre);
            pre.setAttribute("href", "assets/seq/nocut/Frame_0000" + i + " copy.png");
            document.head.appendChild(pre);
        } else {
            pre.setAttribute("href", "assets/seq/cut/Frame_0000" + i + " copy.png");
            document.head.appendChild(pre);
            pre.setAttribute("href", "assets/seq/nocut/Frame_000" + i + " copy.png");
            document.head.appendChild(pre);
        }
    }
}

preload();

window.addEventListener("scroll", onScrollHandler);

var rellax = new Rellax('.rellax');

function randomizecolor() {

    let random_num = document.documentElement.dataset.theme || 1;
    while (random_num == document.documentElement.dataset.theme) {
        random_num = Math.floor(Math.random() * 4) + 1;
    };

    document.documentElement.setAttribute("data-theme", random_num);
}

AOS.init({
    offset: 150,
    easing: 'ease-in-quart',
    duration: 500,
});

randomizecolor();
