document.getElementById("continue").onclick = prepareButton;

function prepareButton()
{ 
    if (document.getElementById("p1").classList == "active") {
        document.getElementById("content1").style.display = "none";
        document.getElementById("p2").classList.remove("disabled");
        document.getElementById("p2").classList.add("active");
        
        document.getElementById("content2").style.display = "block";
        document.getElementById("p1").classList.remove("active");
        
    } else if (document.getElementById("p2").classList == "active"){
        document.getElementById("content2").style.display = "none";
        document.getElementById("p3").classList.remove("disabled");
        document.getElementById("p3").classList.add("active");
        
        document.getElementById("content3").style.display = "block";
        document.getElementById("p2").classList.remove("active");

    } else if (document.getElementById("p3").classList == "active"){
        document.getElementById("content3").style.display = "none";
        document.getElementById("p4").classList.remove("disabled");
        document.getElementById("p4").classList.add("active");
        
        document.getElementById("content4").style.display = "block";
        document.getElementById("p3").classList.remove("active");

    } else if (document.getElementById("p4").classList == "active"){
        document.getElementById("content4").style.display = "none";
        document.getElementById("p5").classList.remove("disabled");
        document.getElementById("p5").classList.add("active");
        
        document.getElementById("content5").style.display = "block";
        document.getElementById("p4").classList.remove("active");

    } else if (document.getElementById("p5").classList == "active"){
        document.getElementById("content5").style.display = "none";
        document.getElementById("p6").classList.remove("disabled");
        document.getElementById("p6").classList.add("active");
        
        document.getElementById("content6").style.display = "block";
        document.getElementById("p5").classList.remove("active");

    } else if (document.getElementById("p6").classList == "active"){
        document.getElementById("content6").style.display = "none";
        document.getElementById("p7").classList.remove("disabled");
        document.getElementById("p7").classList.add("active");
        
        document.getElementById("content7").style.display = "block";
        document.getElementById("p6").classList.remove("active");

    } else if (document.getElementById("p7").classList == "active"){
        document.getElementById("content7").style.display = "none";
        document.getElementById("p8").classList.remove("disabled");
        document.getElementById("p8").classList.add("active");
        
        document.getElementById("content8").style.display = "block";
        document.getElementById("p7").classList.remove("active");

        document.getElementById("continue").innerHTML = "<i class='fa fa-long-arrow-right'></i> &nbsp; ارسال نظر";
    }
}

