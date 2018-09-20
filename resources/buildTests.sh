#!/bin/bash
#
# Note filter argment "enable=if(lt(mod(t\,1)\,.1)\,lt(t\,"${audioFileDuration}"))". The logic is to display the frequency of beeps while they sound
# BUT, my mp3 with beeps in it is only 10 seconds long.  Therefore, only show the frequency during the beeps for the first 10 seconds.

colorArray=( red orange yellow green blue indigo violet white darkgray )
titleArray=( "VAST_VIDEO_AD" "VAST_VIDEO_AD" "VAST_VIDEO_AD" "VPAID_VIDEO_AD" "VPAID_VIDEO_AD" "VPAID_VIDEO_AD" "HEADER_BID_AD" "HEADER_BID_AD" "HEADER_BID_AD" )
frequencyArray=( 1000 1250 1500 1750 2000 2250 2500 2750 3000 )
frequencyNameArray=( "1" "1_25" "1_5" "1_75" "2" "2_25" "2_5" "2_75" "3" )
filenameArray=( vast_zero vast_one vast_two vpaid_zero vpaid_one vpaid_two header_zero header_one header_two )
width=1280
height=720
duration=10
rate=30
audioFileDuration=10

counter=0
while [ $counter -le 8 ]
do
	ffmpeg -f lavfi \
	  -i color=c="${colorArray[$counter]}"@0.2:duration="${duration}":size="${width}"x"${height}":rate="${rate}" \
	  -i "${frequencyNameArray[$counter]}"kbeep.mp3 \
	  -vf drawbox=y=ih/2-40:color=black@0.4:width=iw:height=80:t=max,drawtext="fontfile=ARIALUNI.ttf:text='frame\: '%{n}:x=(w-tw)/2:y=(h-th)/2:fontcolor=white:fontsize=48",drawtext="fontfile=ARIALUNI.ttf:text='"${titleArray[$counter]}"':x=50:y=(h-th)/2:fontcolor=white:fontsize=48",drawtext="fontfile=ARIALUNI.ttf:fontsize=48:fontcolor=white:x=(w-tw-50):y=(h-th)/2:enable=if(lt(mod(t\,1)\,.1)\,lt(t\,"${audioFileDuration}")):text='"${frequencyArray[$counter]}" hz'" \
	  -vcodec h264 -acodec aac -strict -2 "${filenameArray[$counter]}".mp4\
	  ;

	((counter++))
done
echo "Finished building test videos"