<style>
.spreadsheet { --selection: #0288d1;--selection-light: aliceblue;--background: #eee; }
.spreadsheet-inner { flex: 1;display: flex;flex-direction: column;overflow: auto;user-select: none; }
.spreadsheet .line { position: relative;display: flex;align-items: center;min-height: 30px;background: white; }
.spreadsheet .line:hover { background: var(--primary-light); }
.spreadsheet .cell { position: relative;display: flex;align-items: center;min-width: 30px;min-height: 30px;background: inherit;box-shadow: inset 0 0 0 .5px var(--background); }
.spreadsheet .cell > * { overflow: hidden;white-space: nowrap;text-overflow: ellipsis;width: 100%;line-height: 30px;padding: 0 8px; }
.spreadsheet .cell[contentEditable] > * { overflow: auto;text-overflow: unset; }
.spreadsheet .cell > *::-webkit-scrollbar { width: 1px;height: 1px; }
.spreadsheet .line.header { z-index: 2;position: sticky;top: 0;left: 0;background: white;font: var(--p2);font-weight: bold; }
.spreadsheet .line.header .cell { cursor: pointer;box-shadow: none; }
.spreadsheet .line.header .cell.sort.asc { text-decoration: underline; }
.spreadsheet .line.header .cell.sort.desc { text-decoration: underline double; }
.spreadsheet .line.header .cell .resizer { position: absolute;right: -1px;cursor: col-resize;width: 6px;height: 100%;padding: 0;border: 0 solid white;outline: 0;transition: none;background: none;box-shadow: none;margin: 0; }
.spreadsheet .line.header .cell:hover .resizer { background: var(--selection);opacity: .6;width: 6px;border-width: 0 1px 0 1px; }
.spreadsheet .line.header .cell:hover .resizer:active { opacity: 1; }
.spreadsheet .line.header .cell:hover .resizer:active::before { z-index: 10;position: fixed;top: 0;right: 0;bottom: 0;left: 0;content: ''; }
.spreadsheet { position: relative;display: flex;flex-direction: column;max-height: 80vh;width: 100%;font: var(--p3);overflow: auto; }
.spreadsheet-inner { position: sticky;top:0;left: 0;flex: 1 0;display: flex;flex-direction: column;overflow: hidden;padding-left: 30px; }
.spreadsheet-overlay { pointer-events: none; }
.spreadsheet.stripped .line:nth-child(even) { background: var(--primary-light, #f4f5f6); }
.cell.number { text-align: right;font-variant-numeric: tabular-nums; }
.cell-check { max-width: 30px; }
.cell-check input { width: 30px;height: 30px; }
.cell-check .resizer { display: none; }
:root { --chevron-down: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="%23222" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" shape-rendering="geometricPrecision"><path d="M6 9l6 6 6-6"/></svg>'); }
.spreadsheet .group { cursor: pointer;position: sticky;left:0;display: flex;align-items: center;min-height: 30px;font-weight: 600; }
.spreadsheet .group .length { margin: 0 20px 0 auto;opacity: .6; }
.spreadsheet .group::before { width: 1em;height: 1em;margin-right: 10px;content: var(--chevron-down);transform: rotate(-90deg); }
.spreadsheet .group.active::before { transform: rotate(0); }
.spreadsheet .indent-1 { margin-left: 0; }
.spreadsheet .indent-2, .spreadsheet.indent-1 .line, .group.indent-1 ~ .line { margin-left: 16px; }
.spreadsheet .indent-3, .spreadsheet.indent-2 .line, .group.indent-2 ~ .line { margin-left: 32px; }
.spreadsheet .indent-4, .spreadsheet.indent-3 .line, .group.indent-3 ~ .line { margin-left: 48px; }
.spreadsheet .indent-5, .spreadsheet.indent-4 .line, .group.indent-4 ~ .line { margin-left: 64px; }
.spreadsheet .indent-6, .spreadsheet.indent-5 .line, .group.indent-5 ~ .line { margin-left: 80px; }
.spreadsheet .indent-7, .spreadsheet.indent-6 .line, .group.indent-6 ~ .line { margin-left: 96px; }
.spreadsheet .indent-8, .spreadsheet.indent-7 .line, .group.indent-7 ~ .line { margin-left: 112px; }
.spreadsheet.indent-8 .line, .group.indent-8 ~ .line { margin-left: 128px; }
.toolbar { position: sticky;top: 0;left:0;display: flex;wrap: nowrap; height: 25px;justify-content: space-between;margin-right:15px; margin-bottom: 5px; }
.toolbar button { height:24px; width:20px;background: none;box-shadow: none;font-size: 80%; }
.toolbar button > svg { width: 20px; height: 24px; }
.spreadsheet-wrapper { flex: 1;min-height: 100px;}
.spreadsheet-wrapper { position: relative; display: flex; flex-direction: column; max-height: 80vh; width: 100%; overflow: hidden;margin-left: -15px; }
.breaker {visibility:hidden;position: absolute;right: 1px;top: 0;width: 29px!important; height: 22px; background: transparent;}
.header .cell:hover .breaker{visibility:visible;}
.toolbar-break{cursor: pointer;padding: 2px 5px 0px 5px; margin-left: 5px;border: solid 1px var(--gray1);font-size: 14px; font-weight: 700;}
.toolbar-break .close{ padding:2px 5px;background:#fbf9f9; cursor: pointer;}
.toolbar-break .close:hover{ background:#e8e8e8;}
.toolbar-break .ask { margin-top: 2px;transform: rotate(0deg)}
.toolbar-break .desc {margin-top: 2px;transform: rotate(180deg)}
.spreadsheet-panel-config {box-shadow: var(--box-shadow);overflow: auto; border-radius: var(--border-radius); background: var(--input); width: 0px;transition: width .5s; position: absolute; right: 0; height: 94%;}
.spreadsheet-panel-config.visible {width: 214px; }
.spreadsheet-panel-config.visible:hover{ background: var(--gray02) !important;}
.spreadsheet-panel-config.visible ul li {display: inline-flex;width: 100%;}
.spreadsheet-panel-label {padding: 11px 0px 0px 13px;}
.spreadsheet-panel-config.visible ul li .key{ margin: auto; width: inherit;}
</style>

<template lang="pug">
.spreadsheet-wrapper
  .toolbar(v-if="display_toolbar")
    .row
        div.toolbar-break(v-if="group" v-for="item in group" @click="breakSorting(item)") {{item}}
          <svg :class="{'ask': sort.includes(item) || sort.includes('+'+item), 'desc': sort.includes('-'+item)}" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"	 viewBox="0 0 330 330" style="enable-background:new 0 0 330 330;width: 1em; height: 0.7em" xml:space="preserve"><path id="XMLID_29_" d="M100.606,100.606L150,51.212V315c0,8.284,6.716,15,15,15c8.284,0,15-6.716,15-15V51.212l49.394,49.394	C232.322,103.535,236.161,105,240,105c3.839,0,7.678-1.465,10.606-4.394c5.858-5.857,5.858-15.355,0-21.213l-75-75	c-5.857-5.858-15.355-5.858-21.213,0l-75,75c-5.858,5.857-5.858,15.355,0,21.213C85.251,106.463,94.749,106.463,100.606,100.606z"/><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
          span.close(@click="deleteBreak(item)") x
    .row
      button.export_xls(@click="export_xls" :title="t.export_xls")
        <svg height="512px" style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 512 512" width="512px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="comp_x5F_119-excel"><g><path d="M476.624,97.457H289.746v57.656h43.131c7.934,0,14.371,6.458,14.371,14.413c0.001,7.957-6.438,14.415-14.371,14.415    h-43.131v28.831h43.131c7.934,0,14.371,6.458,14.371,14.408c0.001,7.96-6.438,14.417-14.371,14.417h-43.131v28.828h43.131    c7.934,0,14.371,6.457,14.371,14.415c0.001,7.951-6.438,14.409-14.371,14.409h-43.131v28.832h43.131    c7.934,0,14.371,6.458,14.371,14.417c0,7.956-6.438,14.412-14.371,14.412h-43.131v57.653h186.878    c7.938,0,14.376-6.455,14.375-14.416V111.87C490.999,103.913,484.562,97.457,476.624,97.457z M419.125,356.909h-28.75    c-7.934,0-14.377-6.456-14.377-14.412c0-7.959,6.443-14.417,14.377-14.417h28.75c7.933,0,14.373,6.458,14.373,14.417    C433.498,350.453,427.058,356.909,419.125,356.909z M419.125,299.248h-28.75c-7.934,0-14.377-6.458-14.377-14.409    c0-7.958,6.443-14.415,14.377-14.415h28.75c7.933,0,14.373,6.457,14.373,14.415C433.498,292.79,427.058,299.248,419.125,299.248z     M419.125,241.596h-28.75c-7.934,0-14.377-6.457-14.377-14.417c0-7.95,6.443-14.408,14.377-14.408h28.75    c7.933,0,14.373,6.458,14.373,14.408C433.498,235.139,427.058,241.596,419.125,241.596z M419.125,183.939h-28.75    c-7.934,0-14.377-6.458-14.377-14.415c0-7.955,6.443-14.413,14.377-14.413h28.75c7.933,0,14.373,6.458,14.373,14.413    C433.498,177.482,427.058,183.939,419.125,183.939z"/><path d="M274.548,43.115c-3.282-2.738-7.681-3.922-11.819-3.053L32.731,83.3c-6.814,1.275-11.73,7.211-11.73,14.157v317.106    c0,6.919,4.916,12.883,11.73,14.157l229.997,43.24c0.862,0.17,1.754,0.259,2.646,0.259c3.334,0,6.582-1.152,9.172-3.318    c3.309-2.734,5.199-6.828,5.199-11.099v-43.239v-57.653V328.08v-28.832v-28.824v-28.828v-28.826v-28.831v-28.827V97.457V54.219    C279.745,49.921,277.854,45.855,274.548,43.115z M217.338,324.504c-2.732,2.395-6.1,3.578-9.466,3.578    c-3.992,0-7.96-1.675-10.809-4.954l-41.799-47.891l-36.659,47.277c-2.843,3.665-7.071,5.565-11.354,5.565    c-3.073,0-6.21-0.98-8.857-3.025c-6.236-4.898-7.388-13.953-2.499-20.241l40.078-51.657l-39.532-45.317    c-5.232-5.97-4.627-15.078,1.351-20.32c5.923-5.25,15.01-4.703,20.269,1.357l35.88,41.102l42.583-54.889    c4.909-6.253,13.938-7.407,20.176-2.504c6.238,4.896,7.395,13.95,2.507,20.238l-45.978,59.271l45.46,52.088    C223.918,310.152,223.316,319.262,217.338,324.504z"/></g></g><g id="Layer_1"/></svg>
      button.export_csv(@click="export_csv" :title="t.export_csv")
        <svg width="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g id="Element"><path d="M449,30.48V251.94H430.25V36.57c0-9-6.71-16.25-15-16.25H153.73L172.31,0H420.87C436.4,0,449,13.65,449,30.48Z"/><polygon points="81.48 99.35 81.48 251.94 62.73 251.94 62.73 119.87 81.48 99.35"/><path d="M172.31,0V88c0,17.59-13.05,31.85-29.12,31.85H62.73L81.48,99.35l72.25-79Z"/><path d="M490.31,272.25H21.69c-12,0-21.69,9.1-21.69,20.32v77.21C0,381,9.71,390.1,21.69,390.1H490.31c12,0,21.69-9.1,21.69-20.32V292.57C512,281.35,502.29,272.25,490.31,272.25ZM219.76,350.79a26,26,0,0,1-14,13.51,31.82,31.82,0,0,1-12.59,2.3,44,44,0,0,1-9.92-1,27.79,27.79,0,0,1-8.11-3.22,27.06,27.06,0,0,1-6.69-5.76,34.26,34.26,0,0,1-4.66-7.26,38,38,0,0,1-2.89-8.58,46.8,46.8,0,0,1-1-9.68,43.08,43.08,0,0,1,2.42-14.9,31.75,31.75,0,0,1,6.93-11.25,30.18,30.18,0,0,1,10.58-7.12,34.21,34.21,0,0,1,12.92-2.44,32.36,32.36,0,0,1,14.9,3.33,27.11,27.11,0,0,1,10,8.25q3.48,4.9,3.48,9.28a6.08,6.08,0,0,1-1.69,4.23,5.4,5.4,0,0,1-4.09,1.84,5.67,5.67,0,0,1-4-1.27,18,18,0,0,1-3-4.37A21,21,0,0,0,202,309a15.67,15.67,0,0,0-9.09-2.53,16.47,16.47,0,0,0-13.7,6.53q-5.11,6.52-5.1,18.56a34.61,34.61,0,0,0,2.25,13.38,17,17,0,0,0,6.39,8,17.61,17.61,0,0,0,9.68,2.63,17,17,0,0,0,10.18-3,18,18,0,0,0,6.27-8.77,15.33,15.33,0,0,1,2.21-4.44,5,5,0,0,1,4.23-1.71,5.92,5.92,0,0,1,4.28,1.74,5.78,5.78,0,0,1,1.79,4.32A18.22,18.22,0,0,1,219.76,350.79ZM283.07,356a21.44,21.44,0,0,1-9.42,7.8,35.32,35.32,0,0,1-14.71,2.82q-10.2,0-16.83-3.85a22.53,22.53,0,0,1-7.64-7.4,16.88,16.88,0,0,1-2.93-9A6,6,0,0,1,233.3,342a6,6,0,0,1,4.49-1.81,5.28,5.28,0,0,1,3.73,1.41,11.12,11.12,0,0,1,2.61,4.18,27.74,27.74,0,0,0,2.85,5.5,11.44,11.44,0,0,0,4.3,3.65,16,16,0,0,0,7.28,1.43q6.21,0,10.08-2.89a8.69,8.69,0,0,0,3.88-7.22,7.66,7.66,0,0,0-2.09-5.57,13.57,13.57,0,0,0-5.41-3.26c-2.2-.75-5.16-1.55-8.85-2.4A65.09,65.09,0,0,1,243.73,331a20.13,20.13,0,0,1-7.94-6.35,16.47,16.47,0,0,1-2.94-10,17.12,17.12,0,0,1,3.11-10.1,19.49,19.49,0,0,1,9-6.79,36.81,36.81,0,0,1,13.82-2.37,34.12,34.12,0,0,1,11,1.57,23.2,23.2,0,0,1,7.69,4.18,17.59,17.59,0,0,1,4.46,5.48,12.6,12.6,0,0,1,1.41,5.59,6.59,6.59,0,0,1-1.76,4.49,5.62,5.62,0,0,1-4.39,2,5.07,5.07,0,0,1-3.65-1.2,16.14,16.14,0,0,1-2.7-3.93,17.72,17.72,0,0,0-4.51-6.08q-2.64-2.19-8.46-2.19a14.61,14.61,0,0,0-8.72,2.38q-3.32,2.37-3.31,5.71a5.76,5.76,0,0,0,1.13,3.57,9.44,9.44,0,0,0,3.1,2.58,20.48,20.48,0,0,0,4,1.69c1.35.41,3.57,1,6.68,1.79a104.62,104.62,0,0,1,10.55,3,31.84,31.84,0,0,1,8,4,16.37,16.37,0,0,1,5.17,5.95,19,19,0,0,1,1.86,8.81A20.2,20.2,0,0,1,283.07,356Zm70.52-52.14a21.15,21.15,0,0,1-.7,2.35c-.28.77-.57,1.56-.85,2.37l-16.68,45c-.6,1.72-1.19,3.36-1.79,4.91a20.31,20.31,0,0,1-2.07,4.09,9,9,0,0,1-7.89,4,9.51,9.51,0,0,1-4.77-1.1,9.18,9.18,0,0,1-3.15-2.91,21.18,21.18,0,0,1-2.09-4.12c-.6-1.53-1.19-3.16-1.79-4.88l-16.4-44.65q-.42-1.23-.87-2.4a17.63,17.63,0,0,1-.75-2.54,10.45,10.45,0,0,1-.31-2.3,6.1,6.1,0,0,1,1.93-4.37,6.46,6.46,0,0,1,4.84-2c2.38,0,4.06.72,5.05,2.18a28.8,28.8,0,0,1,3,7l15.61,46.2,15.65-46.53q1.21-3.66,1.83-5.1a6.79,6.79,0,0,1,2-2.58,5.91,5.91,0,0,1,3.85-1.15,6.62,6.62,0,0,1,5.71,3.26,5.85,5.85,0,0,1,.87,3A9.71,9.71,0,0,1,353.59,303.84Z"/><path d="M439.76,400.25c-5.18,0-9.38,4.55-9.38,10.16v65c0,9-6.71,16.25-15,16.25H96.62c-8.29,0-15-7.27-15-16.25v-65c0-5.61-4.2-10.16-9.38-10.16s-9.37,4.55-9.37,10.16v71.11C62.87,498.35,75.47,512,91,512H421c15.52,0,28.12-13.65,28.12-30.48V410.41C449.13,404.8,444.94,400.25,439.76,400.25Z"/></g></svg>
      button.config-grid(@click="showConfig = !showConfig")
        <svg enable-background="new 0 0 24 24" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg"><path d="m22.683 9.394-1.88-.239c-.155-.477-.346-.937-.569-1.374l1.161-1.495c.47-.605.415-1.459-.122-1.979l-1.575-1.575c-.525-.542-1.379-.596-1.985-.127l-1.493 1.161c-.437-.223-.897-.414-1.375-.569l-.239-1.877c-.09-.753-.729-1.32-1.486-1.32h-2.24c-.757 0-1.396.567-1.486 1.317l-.239 1.88c-.478.155-.938.345-1.375.569l-1.494-1.161c-.604-.469-1.458-.415-1.979.122l-1.575 1.574c-.542.526-.597 1.38-.127 1.986l1.161 1.494c-.224.437-.414.897-.569 1.374l-1.877.239c-.753.09-1.32.729-1.32 1.486v2.24c0 .757.567 1.396 1.317 1.486l1.88.239c.155.477.346.937.569 1.374l-1.161 1.495c-.47.605-.415 1.459.122 1.979l1.575 1.575c.526.541 1.379.595 1.985.126l1.494-1.161c.437.224.897.415 1.374.569l.239 1.876c.09.755.729 1.322 1.486 1.322h2.24c.757 0 1.396-.567 1.486-1.317l.239-1.88c.477-.155.937-.346 1.374-.569l1.495 1.161c.605.47 1.459.415 1.979-.122l1.575-1.575c.542-.526.597-1.379.127-1.985l-1.161-1.494c.224-.437.415-.897.569-1.374l1.876-.239c.753-.09 1.32-.729 1.32-1.486v-2.24c.001-.757-.566-1.396-1.316-1.486zm-10.683 7.606c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"/></svg>
  .spreadsheet(:id="'uid-' + _uid" :class="'indent-' + group.length" @scroll="onScroll")
    .spreadsheet-inner
      slot(name="header")
        .line.header
          .cell(:class="['cell-' + column.join('dash'), sort.find(v => v.endsWith(column)) && ['sort', 'sort-' + sort.findIndex(v => v.endsWith(column)), sort.find(v => v === '-' + column) ? 'desc' : 'asc'].join(' ')]" v-for="column, y in columns.map('name')")
            slot(:name="'header-' + column.join('dash')" :column="column")
              div(v-text="t[column] || column.join('title')")
            button.breaker(@click="setGroup(column)" v-if="column !=='check' && !group.includes(column) && group.length <= 4") <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z"/></svg>
            button.resizer(@dblclick="autoresize(y)")
      template(v-for="line, x in view")
        .group(:class="[{ active: level < line._path.length ? retract[line._path] : !retract[line._path] }, 'indent-' + line._path.length]" @click="retract = { ...retract, [line._path]: !retract[line._path] }" v-if="line._group")
          slot(name="group" :line="line")
            .key {{ line._key }}
            .length {{ line._length }}
        slot(name="line" v-else)
          .line(:class="format_class(line)" :key="x")
            .cell(:class="['cell-' + column.join('dash'), 'r' + (x + offset + 1), 'c' + (y + 1), format_class(line, columns[y])]" v-for="column, y in columns.map('name')")
              slot(:name="'cell-' + column.join('dash')" :line="line" :column="column")
                div(v-text="format(line, columns[y])")
      slot(name="footer")
    .spreadsheet-panel-config(:class="{visible: showConfig}" :style="'top: '+positionPanel.top+'px;right: '+positionPanel.right+'px;'")
      .spreadsheet-panel-label Column Chooser
      ul
        li(v-for="col in columns")
          input(v-if="col.name!== 'check'" type="checkbox" :name="col.name" :false-value="true" :true-value="false" v-model="col.hide")
          .key(v-if="col.name!== 'check'") {{col.name}}
    .spreadsheet-overlay(:style="'min-width: ' + (group.length * 16 + columns.map('size').sum()) + 'px;min-height: ' + Math.max(1, (lines.length - size) * 30) + 'px;'" v-if="!transpose")
    .spreadsheet-style(v-html="'<style>' + style + '</style>'")
</template>

<script>
export const additions = {}
export default {
  mixins: [{
    data() {
      return {
        autosize: c => c && $$('.cell-' + c.name.join('dash'), this.$el).map(el => el.children[0] && el.children[0].scrollWidth + 15 || 0).max() || 0,
        autoresize: y => (this.columns[y].size = 30, this.$nextTick(() => this.columns[y].size = this.autosize(this.columns[y]))),
        offset: 0,
        size: 0,
        refresh: null,
      }
    },
    computed: {
      view() { return this.lines.slice(this.offset, this.offset + this.size) },
    },
    mounted() {
      const spreadsheet = this.$el.querySelector('.spreadsheet')
      const s = spreadsheet.querySelector('.spreadsheet-inner')
      const width_fn = () => this.columns.map(c => c.size = Math.min(c.size || 250, Math.max(30, c.size || this.autosize(c))))
      const height_fn = () => this.size = Math.floor(spreadsheet.clientHeight / 30) - 1
      const offset_fn = () => {
        this.offset = Math.ceil(spreadsheet.scrollTop / 30)
        s.scrollLeft = spreadsheet.scrollLeft
      }
      this.refresh = () => {
        requestAnimationFrame(offset_fn)
        requestAnimationFrame(height_fn)
        requestAnimationFrame(width_fn)
      }
      this.$watch('lines', this.refresh, { immediate: true })
      window.addEventListener('resize', this.refresh)
      spreadsheet.addEventListener('scroll', () => requestAnimationFrame(offset_fn))
    },
  }],
  props: ['data', 'options'],
  data() {
    const key = this.options && this.options.key
    const store = JSON.parse(localStorage[key] || '{}')
    if (key) this.$nextTick(() => {
      // ['columns', 'filter', 'group', 'sort'].map(k => this.$watch('options.' + k, o => this[k] = o))
      ['columns', 'sort'].map(k => this.$watch(k, o => (store[k] = o, localStorage[key] = JSON.stringify(store))))
    })
    const d0 = this.data && this.data[0] || {}
    const options = {
      columns: d0.keys(),
      format: (line, column) => line[column.name],
      format_class: (line, column) => column && column.type,
      filter: null,
      group: [],
      sort: [],
      editable: true,
      transpose: false,
      regroup: [],
      level: Infinity,
      ...this.options,
      ...store,
    }
    const data = {
      lines: [],
      columns: options.columns.map(c => ({
        name: c.name || c,
        size: null,
        type: Object.prototype.toString.call(d0[c.name || c]).slice(8, -1).toLowerCase(),
        freeze: false,
        hide: false,
        ...c.name ? c : {},
      })),
      format: options.format,
      format_class: options.format_class,
      filter: options.filter,
      group: options.group,
      sort: options.sort,
      editable: options.editable,
      transpose: options.transpose,
      regroup: options.regroup,
      positionPanel: { top: 31, right: 0},
      selection: this.selection || [],
      retract: this.retract || {},
      level: options.level,
      key,
      inside: false,
      showConfig: false,
      edit_mode: false,
      display_toolbar: options.display_toolbar
    }
    const traverse = node => !node || typeof node !== 'object' ? node : node.map(traverse)
    const state = traverse(data)
    data.reset = () => traverse(state).map((v, k) => this[k] = v)
    return data
  },
  computed: {
    style() {
      let [x1, y1, x2, y2] = this.selection.concat(this.selection).map((v, i) => i % 2 ? v : Math.max(1, v - this.offset)).map(x => x + 1)
      if (x1 === x2 && y1 === y2) x2 = y2 = null
      if (x1 > x2) [x1, x2] = [x2, x1]
      if (y1 > y2) [y1, y2] = [y2, y1]
      return [
        !this.transpose && `#uid-${this._uid} .line { min-width: ${this.columns.map('size').sum()}px; }`,
        !this.transpose && this.columns.map(c => `#uid-${this._uid} .cell-${c.name.join('dash')} { flex: 1 0 ${c.size}px;width: ${c.size}px;position: sticky;left: ${this.group.length * 16}px; }`).join('\n'),
        this.transpose && this.columns.map(c => `#uid-${this._uid} .cell-${c.name.join('dash')} { width: ${this.columns.map('size').max()}px; }`).join('\n'),
        !this.transpose && this.columns.filter(c => c.freeze && !c.hide).map((c, i, cs) => `#uid-${this._uid} .cell.cell-${c.name.join('dash')} { z-index: 5;position: sticky;left: ${cs.slice(0, i).map('size').sum() + this.group.length * 16}px; }`).join('\n'),
        this.columns.filter(c => c.hide).map(c => `#uid-${this._uid} .cell-${c.name.join('dash')} { display: none; }`).join('\n'),
        this.editable && Math.max(this.selection[0], this.selection[2]) > this.offset && `#uid-${this._uid} .line:nth-child(n + ${x1}):nth-child(-n + ${x2}) .cell:nth-child(n + ${y1}):nth-child(-n + ${y2}) { --background: white;background: var(--selection-light); }`,
        this.editable && !this.transpose && Math.max(this.selection[0], this.selection[2]) > this.offset && `#uid-${this._uid} .line:nth-child(${x1}) .cell:nth-child(n + ${y1}):nth-child(-n + ${y2}) { box-shadow: inset 0 .5px 0 0 var(--selection), inset -.5px 0 0 var(--background), inset 0 -.5px 0 0 var(--background), inset .5px 0 0 var(--background); }
        #uid-${this._uid} .line:nth-child(n + ${x1}):nth-child(-n + ${x2}) .cell:nth-child(${y2}) { box-shadow: inset 0 .5px 0 0 var(--background), inset -.5px 0 0 var(--selection), inset 0 -.5px 0 0 var(--background), inset .5px 0 0 var(--background); }
        #uid-${this._uid} .line:nth-child(${x2}) .cell:nth-child(n + ${y1}):nth-child(-n + ${y2}) { box-shadow: inset 0 .5px 0 0 var(--${x1 === x2 ? 'selection' : 'background'}), inset -.5px 0 0 var(--background), inset 0 -.5px 0 0 var(--selection), inset .5px 0 0 var(--background); }
        #uid-${this._uid} .line:nth-child(n + ${x1}):nth-child(-n + ${x2}) .cell:nth-child(${y1}) { box-shadow: inset 0 .5px 0 0 var(--background), inset -.5px 0 0 var(--${y1 === y2 ? 'selection' : 'background'}), inset 0 -.5px 0 0 var(--background), inset .5px 0 0 var(--selection); }
        #uid-${this._uid} .line:nth-child(${x1}) .cell:nth-child(${y1}) { box-shadow: inset 0 .5px 0 0 var(--selection), inset -.5px 0 0 var(--background), inset 0 -.5px 0 0 var(--background), inset .5px 0 0 var(--selection)!important; }
        #uid-${this._uid} .line:nth-child(${x1}) .cell:nth-child(${y2}) { box-shadow: inset 0 .5px 0 0 var(--selection), inset -.5px 0 0 var(--selection), inset 0 -.5px 0 0 var(--background), inset .5px 0 0 var(--${y1 === y2 ? 'selection' : 'background'})!important; }
        #uid-${this._uid} .line:nth-child(${x2}) .cell:nth-child(${y1}) { box-shadow: inset 0 .5px 0 0 var(--${x1 === x2 ? 'selection' : 'background'}), inset -.5px 0 0 var(--background), inset 0 -.5px 0 0 var(--selection), inset .5px 0 0 var(--selection)!important; }
        #uid-${this._uid} .line:nth-child(${x2}) .cell:nth-child(${y2}) { box-shadow: inset 0 .5px 0 0 var(--${x1 === x2 ? 'selection' : 'background'}), inset -.5px 0 0 var(--selection), inset 0 -.5px 0 0 var(--selection), inset .5px 0 0 var(--${y1 === y2 ? 'selection' : 'background'})!important; }`,
        this.editable && this.selection[0] > this.offset && `#uid-${this._uid} .line:nth-child(${this.selection[0] - this.offset + 1}) .cell:nth-child(${this.selection[1] + 1}) { box-shadow: inset 0 0 0 2px var(--selection)!important;z-index: 1!important; }`,
      ].filter().join('\n')
    },
    matrix() {
      const filtered_columns = !((this.lines || [])[0] || {}).hasOwnProperty('_group') ? this.columns.filter(c => c.name !== 'check') : this.group.map(g => '').concat(this.columns.filter(c => c.name !== 'check'))
      return [filtered_columns.map(c => c.name && c.name.join('title'))].concat(this.lines.map(l => {
        if (l.hasOwnProperty('_group')) {
          if (!l._path || l._path.length === 0) return []
          const break_blank_cells = l._path.slice(0, l._path.length -1).map(p => '')
          if (this.options.break_Type(l._path) === 'DATE') return break_blank_cells.concat([new Date(l._key).format('DD/MM/YYYY')])
          if (this.options.break_Type(l._path) === 'DATETIME') return break_blank_cells.concat([new Date(l._key).format('DD/MM/YYYY hh:mm:ss')])
          return break_blank_cells.concat([l._key])
        }
        return filtered_columns.map(c => {
          if (c.type === 'date') return new Date(l[c.name]).format('DD/MM/YYYY')
          if (c.type === 'date_time') return new Date(l[c.name]).format('DD/MM/YYYY hh:mm:ss')
          if (c.type === 'number' && !isNaN(l[c.name])) return Intl.NumberFormat(localStorage.number_lang, { minimumFractionDigits: (l[c.name].split(".")[1] || []).length }).format(l[c.name])
          return l[c.name]
        })
      }))
    },
  },
  methods: {
    breakSorting (col) {
      if(!this.sort.includes(col) && !this.sort.includes('-'+ col) && !this.sort.includes('+'+col)){
        this.sort.push('+'+col)
      }else {
         this.sort_column(col)
      }
    },
    deleteBreak(col) {
      this.group = this.group.filter(e => e !== col)
    },
    setGroup(col) {
      if (!this.group.includes(col) && this.group.length <= 4) this.group.push(col)
    },
    async export_xls() {
      if (!window.XLSX) await inject('https://unpkg.com/xlsx@0.15.6/dist/xlsx.full.min.js')
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.aoa_to_sheet(this.matrix || [])
      XLSX.utils.book_append_sheet(workbook, worksheet)
      return XLSX.writeFile(workbook, (this.options.name || 'table') + '.xlsx')
    },
    export_csv() {
      (this.matrix || []).dlCSV($root.lang, (this.options.name || 'table') + '.csv')
    },
    sort_column(column, $event) {
      const found = this.sort.find(c => c.replace(/^-/, '') === column)
      const inverse = found && found.slice(0, 1) === '-' ? found.slice(1) : '-' + found
      const add = !$event || $event.shiftKey
      if (!add && !found) this.sort = [column]
      if (!add && found) this.sort = [inverse]
      if (add && !found && $event) this.sort = this.sort.concat(column)
      if (add && !found && !$event) this.sort = this.sort.concat('-' + column)
      if (add && found) this.sort = this.sort.map(c => c === found ? inverse : c)
    },
    onScroll(e) {
      this.positionPanel = {
        top: this.$el.querySelector(".spreadsheet").scrollTop + 31,
        right: 0 - this.$el.querySelector(".spreadsheet").scrollLeft
      } 
    },
    mouse($event) {
      requestAnimationFrame(() => {
        if (!$event.target || !$event.target.parentNode || (!$event.path.includes(this.$el) && (!window.mousedown || window.mousedown.$el !== this.$el))) return
        const [x, y] = coordinates($event.target)
        if ($event.type === 'mousedown') {
          let action = 'select'
          if (x === 0) action = 'sort'
          if ($event.target.className === 'resizer') action = 'resize'
          this.edit_mode = this.selection.length !== 0 && (this.selection[0] === x + this.offset)
          if (action === 'select') this.selection = [x + this.offset, y]
          if (action === 'sort') this.selection = []
          return window.mousedown = { action, x, y, target: $event.target, $event, $el: this.$el }
        }
        if (!window.mousedown) return
        if (!document.contains(window.mousedown.target)) return delete window.mousedown
        if ($event.type === 'mouseup') {
          Array.move = (arr, a, b) => (arr = arr.slice(), arr.splice(b, 0, arr.splice(a, 1)[0]), arr)
          window.mousedown.target.style = ''
          if (window.mousedown.action === 'move') (window.mousedown.target.nextSibling.style = '', this.columns = Array.move(this.columns, window.mousedown.y, coordinates(document.elementFromPoint($event.clientX, window.mousedown.$event.clientY))[1]))
          if (window.mousedown.action === 'sort') this.sort_column(this.columns[y].name, $event)
          return delete window.mousedown
        }
        if (window.mousedown.action === 'resize') {
          const cell = window.mousedown.target.parentNode
          const i = Array.from(cell.parentNode.children).findIndex(cell)
          this.columns[i].size = Math.max(30, $event.clientX - cell.getBoundingClientRect().x + 8 - cell.offsetWidth + this.columns[i].size)
          return
        }
        if (window.mousedown.x === 0 && Math.abs(window.mousedown.$event.clientX - $event.clientX) > 20) return (window.mousedown.action = 'move', window.mousedown.target.style = 'cursor: grabbing', window.mousedown.target.nextSibling.style = `z-index: 1;position: fixed;top: ${window.mousedown.target.getBoundingClientRect().top}px;left: ${window.mousedown.target.getBoundingClientRect().left - window.mousedown.$event.clientX + $event.clientX}px;width: ${window.mousedown.target.getBoundingClientRect().width}px;height: ${this.$el.offsetHeight}px;margin: 0;cursor: grabbing;background: darkgray;opacity: .1;`)
        if (window.mousedown.x === 0) return
        return this.selection = [this.selection[0], this.selection[1], (x + this.offset) || this.selection[2], isNaN(y) ? this.selection[3] : y]
      })
    },
    keydown($event) {
      if (!this.inside) return
      if (!this.$el || document.activeElement !== document.body) return
      if ($event.key === 'Escape') return this.selection = []
      if (['ArrowRight', 'ArrowLeft'].includes($event.key) && this.edit_mode) return
      const [x, y] = coordinates(document.elementFromPoint(mouse[0], this.$el.getBoundingClientRect().top))
      if ($event.ctrlKey || $event.metaKey) {
        if (['x', 'c', 'v'].includes($event.key.toLowerCase())) return
        $event.preventDefault()
        // if ($event.key === 'a') return this.selection = [1, 0, this.lines.length, this.columns.length - 1]
        // if ($event.key.toLowerCase() === 'r') return (this.reset(), delete localStorage[this.key])
        if ($event.key.toLowerCase() === 'f') return this.columns[y].freeze = !this.columns[y].freeze
        if ($event.key.toLowerCase() === 'g') return this.group = this.group.includes(this.columns[y].name) ? [] : [this.columns[y].name]
        if ($event.key.toLowerCase() === 'h') return this.columns[y].hide = !this.columns[y].hide
        return
      }
      if (/^(Arrow|Page|Home|End|Tab)/.test($event.key)) {
        if ($event.key === 'ArrowUp') this.selection = [Math.max(1, this.selection[0] - 1), this.selection[1]]
        if ($event.key === 'ArrowDown') this.selection = [Math.min(this.lines.length, this.selection[0] + 1), this.selection[1]]
        if ($event.key === 'ArrowRight' || ($event.key === 'Tab' && !$event.shiftKey)) this.selection = this.selection[1] === this.columns.length - 1 ? this.selection[0] === this.lines.length ? this.selection : [this.selection[0] + 1, 0] : [this.selection[0], this.selection[1] + 1]
        if ($event.key === 'ArrowLeft' || ($event.key === 'Tab' && $event.shiftKey)) this.selection = this.selection[1] === 0 ? this.selection[0] === 1 ? this.selection : [this.selection[0] - 1, this.columns.length - 1] : [this.selection[0], this.selection[1] - 1]
        if ($event.key === 'PageUp') this.selection = [1, this.selection[1]]
        if ($event.key === 'PageDown') this.selection = [this.lines.length, this.selection[1]]
        if ($event.key === 'Home') this.selection = [this.selection[0], 0]
        if ($event.key === 'End') this.selection = [this.selection[0], this.columns.length - 1]
        if (this.lines[this.selection[0] - 1] && this.lines[this.selection[0] - 1]._group && (/^(Up|Home)/.test($event.key) || ($event.key === 'Tab' && !$event.shiftKey))) this.selection[0]++
        if (this.lines[this.selection[0] - 1] && this.lines[this.selection[0] - 1]._group && (/^(Down|End)/.test($event.key) || ($event.key === 'Tab' && $event.shiftKey))) this.selection[0]--
        if (this.offset >= this.selection[0]) this.$el.scrollTop = (this.selection[0] - 1) * 30
        if (this.selection[0] >= this.offset + this.size) this.$el.scrollTop = (this.selection[0] - this.size) * 30
        // const cell = this.$el.querySelector(`.r${this.selection[0]}.c${this.selection[1] + 1}`)
        // if (cell) cell.scrollIntoView()
        return $event.preventDefault()
      }
    },
    cut(e) {

    },
    copy(e) {
      if (!this.inside) return
      let [x1, y1, x2, y2] = this.selection.concat(this.selection)
      if (x1 > x2) [x1, x2] = [x2, x1]
      if (y1 > y2) [y1, y2] = [y2, y1]
      e.clipboardData.setData('text/plain', this.lines.slice(x1 - 1, x2).map(l => this.columns.slice(y1, y2 + 1).map(c => l[c.name]).join('\t')).join('\n'))
      // this.$emit('copy', e.clipboardData.getData('text/plain').split('\n').map(l => l.split('\t')))
      e.preventDefault()
    },
    paste(e) {
      // if (!this.inside) return
      // this.$emit('paste', e.clipboardData.getData('text/plain').split('\n').map(l => l.split('\t')))
      // e.preventDefault()
    },
  },
  created() {
    this.$watch(() => {
      if (this.edit_mode) return
      let data = Object.freeze(Array.from(this.data || []).map((l, x) => ({ _id: x, ...l })))
      if (this.filter) data = data.filter(this.filter)
      if (this.group.length) {
        const traverse = (x, path = []) => ({
          Object: x => {
            if (x.null) {
              x['-'] = x.null
              delete x.null
            }
            if (this.regroup.includes('rename')) x = x.reduce((acc, v, k) => {
              if (Array.isArray(v)) {
                if (v.length === 1 || !k) k = '-'
                acc[k] = (acc[k] || []).concat(traverse(v))
                return acc
              }
              acc[k] = v
              return acc
            }, {})
            if (this.regroup.includes('empty') && x.keys().length === 1 && x.keys()[0] === 'undefined') return traverse(x.v()[0])
            if (this.regroup.includes('single') && x.keys().length === 1) return traverse(x.v()[0])
            return x.map((v, k) => {
              const p = path.concat(k)
              const g = traverse(v, p)
              const child = g.filter(x => x._group && x._path.length === p.length + 1).flatMap(x => x._group)
              const items = child.length ? child : g
              const group = [{ _path: p, _key: k, _group: items, _length: items.length }]
              if (this.level < p.length ? this.retract[p] : !this.retract[p]) return group.concat(g)
              return group
            }).v().flat()
          },
        }[Object.prototype.toString.call(x).slice(8, -1)] || (x => x))(x)
        const sort = this.group.map(g => this.sort.find(c => c.replace(/^-/, '') === g) || g).concat(this.sort.filter(c => !this.group.includes(c.replace(/^-/, ''))))
       return traverse(data.sort(sort).group(this.group))
      }
      if (this.sort.length) return data.sort(this.sort)
      return data
    }, lines => {
      const current = lines[this.selection[0] - 1] || {}
      const next = this.lines[this.selection[0] - 1] || {}
      if (this.selection[0] != null && current.id !== next.id) this.selection = []
      if (lines) this.lines = lines
    }, {
      immediate: true,
    })
  
    this.$watch('selection', (val) => {
      this.$parent.cellSelection = val
      if (!this.edit_mode) return
      const editor = this.$el.querySelector(`.r${this.selection[0]}.c${this.selection[1] + 1} input`)
      if (!editor) return
      /* HACK */const classList = this.$el.querySelector(`.r${this.selection[0]}.c${this.selection[1] + 1}`).classList
      /* HACK */if (classList.contains('cell-fichier') || classList.contains('cell-file')) return
      // editor.scrollIntoView()
      editor.focus()
      editor.click()
    })
     this.$watch('columns', (newVal) => {
       this.group = this.group.filter(el => !newVal.filter(el => el.hide).map(el => el.name).includes(el))
    },{
      deep: true,
    })


    window.$ = (s, el = document) => el.querySelector(s)
    window.$$ = (s, el = document) => Array.from(el.querySelectorAll(s))
    window.find = (el, test) => {
      try {
        while (el.parentNode !== document) {
          if (test(el)) return el
          el = el.parentNode
        }
      } catch(e) {}
    }
    window.coordinates = el => {
      const index = el => Array.from(el.parentNode.children).indexOf(el)
      const cell = find(el, el => el.classList.contains('cell'))
      if (!cell) return []
      return [index(cell.parentNode), index(cell)]
    }
    if (!window.mouse) {
      window.mouse = [0, 0]
      addEventListener('mousemove', e => window.mouse = [e.clientX, e.clientY])
    }
    addEventListener('mousemove', e => {
      const { top, bottom, left, right } = this.$el.getBoundingClientRect()
      this.inside = !(left > mouse[0] || mouse[0] > right || top > mouse[1] || mouse[1] > bottom)
    })
    addEventListener('keydown', e => {
      if (document.activeElement !== document.body && !this.$el.contains(document.activeElement)) return
      if (e.key === 'Enter' && !this.edit_mode && this.selection.length) return this.edit_mode = true
      if ((e.key === 'Enter' || e.key === 'Escape') && this.edit_mode) return (this.edit_mode = false, this.selection = [])
    }, { capture: true })
    addEventListener('cut', this.cut)
    addEventListener('copy', this.copy)
    addEventListener('paste', this.paste)
    addEventListener('keydown', this.keydown, { capture: true })
    addEventListener('mousedown', this.mouse)
    addEventListener('mousemove', this.mouse)
    addEventListener('mouseup', this.mouse)
  },
  destroyed() {
    removeEventListener('cut', this.cut)
    removeEventListener('copy', this.copy)
    removeEventListener('paste', this.paste)
    removeEventListener('keydown', this.keydown)
    removeEventListener('mousedown', this.mouse)
    removeEventListener('mousemove', this.mouse)
    removeEventListener('mouseup', this.mouse)
  },
}
</script>
