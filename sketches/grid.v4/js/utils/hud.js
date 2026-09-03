// adds text readout on the screen

function hud(titleTxt, codeTxt, logTxt){
  let hudBgCol = color(255,240); //color(190,180,15)
  let gutter = 36;
  let hudWidth = width - (gutter);
  let hudHeight = 36;
  let hudTxtSize = 12;
  let txtBaseline = gutter-10;
  let lineWeight = 1;
  let titleTxtInset = 12;


  
  
    push();
      noStroke();
      fill(hudBgCol);
      rect(0, 0, width, hudHeight)


      
      noStroke();
      fill(50);
      textAlign (LEFT,BASELINE);
      textSize(hudTxtSize*1.2)
      textFont(titleFont);
      let titleTxtWidth = textWidth(titleTxt)
      text(titleTxt, titleTxtInset, txtBaseline);
      textSize(hudTxtSize);
      textFont(bodyFont);
      let codeTxtWidth = textWidth(codeTxt)
      let logTxtWidth = textWidth(logTxt)
      let codeTxtInset = titleTxtInset+titleTxtWidth + 24;
      let logTxtInset = width - (logTxtWidth+12);
      text(codeTxt, codeTxtInset, txtBaseline );
      text(logTxt, logTxtInset, txtBaseline );

      stroke(100);
      strokeWeight(lineWeight);
      line(codeTxtInset-12, gutter-10, codeTxtInset-4, gutter-10);
      line(logTxtInset-12,  gutter-10, logTxtInset-4, gutter-10);
      
    pop() ;
}
