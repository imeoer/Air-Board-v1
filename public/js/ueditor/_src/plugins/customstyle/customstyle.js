///import core
///commands 自定义样式
///commandsName  CustomStyle
///commandsTitle  自定义样式
(function() {
    var domUtils = baidu.editor.dom.domUtils,
            dtd = baidu.editor.dom.dtd;

    baidu.editor.plugins['customstyle'] = function() {
        var me = this;
        me.commands['customstyle'] = {
            execCommand : function(cmdName, obj) {
                var me = this,
                        tagName = obj.tag,
                        node = domUtils.findParent(me.selection.getStart(), function(node) {
                            return node.getAttribute('label') == obj.label
                        }, true),
                        range,bk,tmpObj = {};
                for (var p in obj) {
                    tmpObj[p] = obj[p]
                }
                delete tmpObj.tag;
                if (node && node.getAttribute('label') == obj.label) {
                    range = this.selection.getRange();
                    bk = range.createBookmark();
                    if (range.collapsed) {
                        domUtils.remove(node, true);
                    } else {

                        var common = domUtils.getCommonAncestor(bk.start, bk.end),
                                nodes = domUtils.getElementsByTagName(common, tagName);
                        for (var i = 0,ni; ni = nodes[i++];) {
                            if (ni.getAttribute('label') == obj.label) {
                                var ps = domUtils.getPosition(ni, bk.start),pe = domUtils.getPosition(ni, bk.end);
                                if ((ps & domUtils.POSITION_FOLLOWING || ps & domUtils.POSITION_CONTAINS)
                                        &&
                                        (pe & domUtils.POSITION_PRECEDING || pe & domUtils.POSITION_CONTAINS)
                                        )
                                    if (dtd.$block[tagName]) {
                                        var fillNode = me.document.createElement('p');
                                        domUtils.moveChild(ni, fillNode);
                                        ni.parentNode.insertBefore(fillNode, ni);
                                    }
                                domUtils.remove(ni, true)
                            }
                        }
                        node = domUtils.findParent(common, function(node) {
                            return node.getAttribute('label') == obj.label
                        }, true);
                        if (node) {
                            domUtils.remove(node, true)
                        }

                    }
                    range.moveToBookmark(bk).select();
                } else {
                    if (dtd.$block[tagName]) {
                        this.execCommand('paragraph', tagName, tmpObj);
                        range = me.selection.getRange();
                        if (!range.collapsed) {
                            range.collapse();
                            node = domUtils.findParent(me.selection.getStart(), function(node) {
                                return node.getAttribute('label') == obj.label
                            }, true);
                            var pNode = me.document.createElement('p');
                            domUtils.insertAfter(node, pNode);
                            domUtils.fillNode(me.document, pNode);
                            range.setStart(pNode, 0).setCursor()
                        }
                    } else {
                        range = me.selection.getRange();
                        if (range.collapsed) {
                            node = me.document.createElement(tagName);
                            domUtils.setAttributes(node, tmpObj);
                            range.insertNode(node).setStart(node, 0).setCursor();

                            return;
                        }
                        bk = range.createBookmark();
                        range.applyInlineStyle(tagName, tmpObj).moveToBookmark(bk).select()
                    }
                }

            },
            queryCommandValue : function() {
                var startNode = this.selection.getStart(),
                        parent = domUtils.findParent(startNode, function(node) {
                            return node.getAttribute('label')
                        }, true);

                return  parent ? parent.getAttribute('label') : '';
            },
            queryCommandState : function() {
                return this.highlight ? -1 : 0;
            }
        };
        me.addListener('keyup', function(type, evt) {
            var keyCode = evt.keyCode || evt.which;

            if (keyCode == 32 || keyCode == 13) {
                var range = me.selection.getRange();
                if (range.collapsed) {
                    var node = domUtils.findParent(me.selection.getStart(), function(node) {
                        return node.getAttribute('label') != ""
                    }, true);
                    if (node) {
                        if (baidu.editor.dom.dtd.$block[node.tagName] && domUtils.isEmptyNode(node)) {
                            var p = me.document.createElement('p');
                            domUtils.insertAfter(node, p);
                            domUtils.fillNode(me.document, p);
                            domUtils.remove(node);
                            range.setStart(p, 0).setCursor();

                        }
                    }
                }
            }
        })

    }


})();