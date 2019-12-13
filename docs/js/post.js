$(function() {
    const getOffset = (element, horizontal = false) => {
        if(!element) return 0;
        return getOffset(element.offsetParent, horizontal) + (horizontal ? element.offsetLeft : element.offsetTop);
    }

    // another implementation.
    const getOffsetTop = element => {
        let offsetTop = 0;
        while(element) {
          offsetTop += element.offsetTop;
          element = element.offsetParent;
        }
        return offsetTop;
    }

    const getTocMap = class_style => {
        var tocItemEles = document.querySelectorAll(class_style);
        var tocItemsMap = [];
        for(var i=0; i<tocItemEles.length; i++) {
            var tocItemEle = tocItemEles[i];
            var toc_id = tocItemEle.firstChild.href.split("#")[1];
            var targetItem = document.querySelector("#" + toc_id);
            // _offsetTop = targetItem.offsetTop;
            _offsetTop = getOffset(targetItem);

            tocItemsMap.push(
                {
                    offsetTop: _offsetTop-10,
                    id: "#"+toc_id,
                    obj: tocItemEle
                }
            );
        }
        return tocItemsMap
    }

    function winScroll(e){
        var curActivateTocItem = document.querySelector("li.toc-item.activate")
        var curActivateTocItemId = "#" + curActivateTocItem.firstChild.href.split("#")[1];
        var scrollTop = document.documentElement.scrollTop;
        // var scrollTop = document.body.scrollTop;
        var targetTocItem;
        var tocItemsMap = getTocMap("li.toc-item");

        var found = false;
        for(var i=0; i<tocItemsMap.length; i++) {
            if (scrollTop < tocItemsMap[i].offsetTop) {
                if (i === 0) {
                    var targetIndex = i;
                } else {
                    var targetIndex = i - 1;
                }
                var target_ele_id = tocItemsMap[targetIndex].id;
                if (target_ele_id === curActivateTocItemId) {
                    return
                }
                targetTocItem = tocItemsMap[targetIndex].obj;
                found = true;
                break
            }
        }
        if (found === false) {
            targetTocItem = tocItemsMap[tocItemsMap.length-1].obj;

        }
        curActivateTocItem.classList.toggle("activate");
        targetTocItem.classList.toggle("activate");
    }

    var tocItemsMap = getTocMap("li.toc-item");
    tocItemsMap[0].obj.classList.toggle("activate");
    window.addEventListener('scroll',winScroll);
});
