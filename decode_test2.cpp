#include <ros/ros.h>
#include <image_transport/image_transport.h>
#include <cv_bridge/cv_bridge.h>
#include <sensor_msgs/image_encodings.h>
#include <opencv2/imgproc/imgproc.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/highgui/highgui_c.h>
#include <sensor_msgs/Image.h>
#include <opencv2/opencv.hpp>
#include <geometry_msgs/Point.h>
#include <std_msgs/Float64MultiArray.h>
#include <cmath>
#include <std_msgs/String.h>
#include <vlp/LedBinary.h>
#include <geometry_msgs/PointStamped.h>

struct PositionData {
    double x;
    double y;
    double z;
};


class ImageProcessor {
public:
    ImageProcessor(ros::NodeHandle& nh) : it_(nh) {
        // Subscribe to input video feed and publish output video feed
        image_sub_ = it_.subscribe("/camera/color/image_raw", 1, &ImageProcessor::imageCb, this);
        pub = nh.advertise<sensor_msgs::Image>("/camera/gray/image_mono", 10);
	pub2 = nh.advertise<geometry_msgs::PointStamped>("led_point", 10);
        //led_state_pub = nh.advertise<vlp::LedBinary>("decoded_message", 1);
	//vector_publisher = nh.advertise<std_msgs::Float64MultiArray>("vector_topic", 10);
    }

    void imageCb(const sensor_msgs::ImageConstPtr& msg) {
        cv_bridge::CvImagePtr cv_ptr;
        try {
            cv_ptr = cv_bridge::toCvCopy(msg, sensor_msgs::image_encodings::BGR8);
        } catch (cv_bridge::Exception& e) {
            ROS_ERROR("cv_bridge exception: %s", e.what());
            return;
        }
        // Convert to grayscale
        cv::Mat grayscale;
        cv::cvtColor(cv_ptr->image, grayscale, cv::COLOR_BGR2GRAY);

	    // eliminate noise
	    cv::Mat denoised;
	    cv::GaussianBlur(grayscale, denoised, cv::Size(5, 5), 0);

        // Binarize the image
        cv::Mat binary_image;
        cv::threshold(grayscale, binary_image, 128, 255, cv::THRESH_BINARY);

	    // dilate the image
	    cv::Mat dilate_image;
	    cv::dilate(binary_image, dilate_image, cv::Mat());
	
        //Canny
	    //cv::Mat edges;
        //cv::Canny(dilate_image, edges, 50, 150);
        
	    //tempImage
	    cv::Mat tempImage = imread("/home/ubuntu/catkin_ws/src/vlp/src/led4.png", cv::IMREAD_GRAYSCALE);

	    //resultImage
        cv::Mat resultImage;
        int resultImage_rows = dilate_image.rows - tempImage.rows + 1;
	    int resultImage_cols = dilate_image.cols - tempImage.cols + 1;
	    resultImage.create(resultImage_rows, resultImage_cols, CV_32FC1);//convert to 32 float number

	    int method = cv::TM_CCOEFF_NORMED;
	    cv::matchTemplate(dilate_image, tempImage, resultImage, method);
	    cv::normalize(resultImage, resultImage, 0, 1, cv::NORM_MINMAX, -1, cv::Mat());

	    //threshold
        double threshold = 0.8;
        cv::threshold(resultImage, resultImage, threshold, 1.0, cv::THRESH_TOZERO);

	    double minValue, maxValue;
	    cv::Point minLocation, maxLocation, matchLocation;
        
	    cv::minMaxLoc(resultImage, &minValue, &maxValue, &minLocation, &maxLocation, cv::Mat());

	  
        
        
        cv::Rect roiRect(maxLocation.x , maxLocation.y , tempImage.rows , tempImage.cols );
        
        // Decode the binary message
        //std::string message;
        //for (int i = 0; i < edges.cols; ++i) {
        //if (edges.at<uchar>(0, i) > 0) {
           // message += "1";
        //} else {
           // message += "0";
       // }
     // }
                
        //Contour detection
                //std::vector<std::vector<cv::Point>> contours;
                //cv::findContours(edges, contours, cv::RETR_EXTERNAL, cv::CHAIN_APPROX_SIMPLE);
        //First Contour
                //std::vector<cv::Point> contour = contours[0];

                //cv::Rect contourRect = cv::boundingRect(contour);
                //cv::Mat roiContour = roi(contourRect);
	
	if (resultImage.at<float>(maxLocation.y, maxLocation.x) >threshold){
		int width = tempImage.cols;
		int height = tempImage.rows;
		double scale_factor = 0.8;
		cv::Rect shrunkRect = roiRect;
		shrunkRect.width = cvRound(roiRect.width * scale_factor);
		shrunkRect.height = cvRound(roiRect.height * scale_factor);
	cv::rectangle(grayscale, shrunkRect, cv::Scalar(255, 255, 255), 2, 8, 0);
	
	cv::Mat matchedArea = grayscale(shrunkRect);

	cv::Mat edgeImage = matchedArea.clone();
	
	cv::Mat edges;
	cv::Canny(edgeImage, edges, 150, 50);

        //cv::Mat demodulatedImage = roiContour.clone();
        //int windowSize = 5;

	//for(int y = 0; y < edges.rows; ++y){
		//for(int x = 0; x < edges.cols; ++x){
			//if(edges.at<uchar>(y, x) > 0){
				//cv::Rect roi(x - windowSize / 2, y - windowSize / 2, windowSize, windowSize);
				//cv::Mat window = matchedArea(roi);
				//double meanValue = cv::mean(window)[0];

				//demodulatedImage.at<uchar>(y, x) = static_cast<uchar>(meanValue);
			//}
		//}
	//}
	std::vector<cv::Point> locations;
	cv::findNonZero(resultImage, locations);

	std::vector<std::vector<cv::Point>> contours;
	std::vector<cv::Vec4i> hierarchy;
	      
       cv::Mat roiContour = edges.clone();
       cv::Mat my_binary_image;
       cv::threshold(roiContour, my_binary_image, 128, 255, cv::THRESH_BINARY);
       cv::findContours(my_binary_image, contours, hierarchy, cv::RETR_TREE, cv::CHAIN_APPROX_SIMPLE);
       //找到最大輪廓
           size_t maxContourIndex = 0;
           double maxContourArea = cv::contourArea(contours[0]);

           for (int i = 1; i < contours.size(); ++i) {
               double area = cv::contourArea(contours[i]);
               if (area > maxContourArea) {
		       maxContourArea = area;
		       maxContourIndex = i;
	       }
	      }
                 
       //計算最大輪廓的中心座標
       cv::Moments moments = cv::moments(contours[maxContourIndex]);
       double centerX = moments.m10 / moments.m00;
       double centerY = moments.m01 / moments.m00;
	
       cv::Mat contourImage = cv::Mat::zeros(my_binary_image.size(), CV_8UC3);	
       cv::drawContours(contourImage, contours, -1, cv::Scalar::all(255));

       cv::Rect roicenter(contourImage.cols / 2, 0 ,1, contourImage.rows);
       cv::Mat roiCenterCol = contourImage(roicenter);

       // 获取中心像素的灰度值
       //uchar centerPixelValue = cv_ptr->image.at<uchar>(centerY, centerX);
       uchar centerPixelValue = roiCenterCol.at<uchar>(centerX, centerY);
       //設定ook解調閥值
       uchar thresholdValue = 128;

       //進行ook解調，將結果轉換成0跟1

       //cv::Mat ookDemodulation;
       //cv::compare(roiCenterCol, thresholdValue, ookDemodulation, cv::CMP_GT);
       

       //cv::threshold(ookDemodulation, ookDemodulation, 0, 1, cv::THRESH_BINARY);
       int binary_value = (centerPixelValue > thresholdValue) ? 1 : 0;
       binary_data_.push_back(binary_value);
       
       for (size_t i = 0; i < binary_data_.size(); ++i) {
        ROS_INFO("Center %zu Pixel Value: %d", i, static_cast<int>(binary_data_[i]));
     }
       ROS_INFO("Center Pixel Value: %d", centerPixelValue);
       
       //std::cout << "Demodulated Signal: " << ookDemodulation << std::endl;
       //std::cout << "Demodulated Signal: " << binary_value << std::endl;
       //std::cout << "LED ROI Center : ( " << centerX << ", " << centerY << ")" << std::endl;

       //cv::Mat cornerPosition = contourImage.clone();
       cornerPosition.push_back(contourImage.clone());
        

       //std::vector<cv::Vec3f> circles;
       //cv::HoughCircles( cornerPosition, circles, cv::HOUGH_GRADIENT, 1, cornerPosition.rows / 8, 100, 30, 10, 50);

       //if (!circles.empty()) {
        //size_t maxRadiusIndex = 0;
        //double maxRadius = circles[0][2];

        //for (size_t i = 1; i < circles.size(); ++i) {
            //double radius = circles[i][2];
            //if (radius > maxRadius) {
                //maxRadius = radius;
                //maxRadiusIndex = i;
           // }
        //}

	//cv::Vec3i bestCircle = circles[maxRadiusIndex];
        //cv::Point center(bestCircle[0], bestCircle[1]);
        //float radius = bestCircle[2];

	//cv::Mat image;

	//cv::Mat circleContour = cv::Mat::zeros(image.size(), CV_8UC3);
        //cv::circle(circleContour, center, radius, cv::Scalar(255, 255, 255), 2);
       
       //cv::Point top(cx, cy - 10);
       //cv::Point bottom(cx, cy + 10);
       //cv::Point left(cx - 10, cy);
       //cv::Point right(cx + 10, cy);
       
       //cv::line(img, left, right, cv::Scalar(0, 255, 0), 2);
       //cv::line(img, top, bottom, cv::Scalar(0, 255, 0), 2);
    //bool process_next_image = false;
     
    for (const auto& contour : contours) {
           float radius;
           cv::Point2f center;
           cv::minEnclosingCircle(contour, center, radius);

	   //int binary_value = (centerPixelValue > thresholdValue) ? 1 : 0;
           //binary_data_.push_back(binary_value);

           //ROS_INFO("Binary Value: %d", binary_value);
       
           //cv::Mat cornerPosition = contourImage.clone();
   

        // 计算四个角位
        //std::vector<cv::Point> vertices;
        double angle = M_PI / 4; // 45度
        for (int i = 0; i < 4; i++) {
             vertices.push_back(cv::Point(center.x + radius * cos(angle),center.y + radius * sin(angle)));
            angle += M_PI / 2; // 增加90度，以找到下一个顶点
        }
     }
       pub.publish(cv_ptr->toImageMsg());
    void publishPointsAndImages(const std::vector<cv::Point>& vertices, const std::vector<cv::Mat>& cornerPosition) {
        // 绘制四个角位
       //cv::Mat cornerPosition = contourImage.clone();
       

        for (const auto& vertex : vertices) {
            cv::circle(cornerPosition, vertex, 5, cv::Scalar(0, 0, 255), -1);
        }

        // 绘制圆心
        //cv::circle(cornerPosition, center, radius, cv::Scalar(255, 0, 0), -1);
        //cv::circle(cornerPosition, center, cvRound(radius), cv::Scalar(0, 0, 255), 2);


           if (vertices.size() == 4) {

           PositionData positions[4];
           cv::Point corner1 = vertices[0];
           cv::Point corner2 = vertices[1];
           cv::Point corner3 = vertices[2];
           cv::Point corner4 = vertices[3];

           std::cout << "Corner 1: (" << corner1.x << ", " << corner1.y << ")" << std::endl;
           std::cout << "Corner 2: (" << corner2.x << ", " << corner2.y << ")" << std::endl;
           std::cout << "Corner 3: (" << corner3.x << ", " << corner3.y << ")" << std::endl;
           std::cout << "Corner 4: (" << corner4.x << ", " << corner4.y << ")" << std::endl;
           
           // 在图像上绘制角点
           cv::circle(cornerPosition, corner1, 5, cv::Scalar(0, 255, 0), -1);
           cv::circle(cornerPosition, corner2, 5, cv::Scalar(0, 255, 0), -1);
           cv::circle(cornerPosition, corner3, 5, cv::Scalar(0, 255, 0), -1);
           cv::circle(cornerPosition, corner4, 5, cv::Scalar(0, 255, 0), -1);
           
            
           
           //positions[0] = { corner1.x, corner1.y }; 
           //positions[1] = { corner2.x, corner2.y };
           //positions[2] = { corner3.x, corner3.y };
           //positions[3] = { corner4.x, corner4.y };
           
       geometry_msgs::PointStamped corner1Point;
	   corner1Point.point.x = corner1.x;
	   corner1Point.point.y = corner1.y;
	   corner1Point.header.frame_id = "camera_frame";
	   corner1Point.header.stamp = msg->header.stamp;
	   
	   geometry_msgs::PointStamped corner2Point;
	   corner2Point.point.x = corner2.x;
	   corner2Point.point.y = corner2.y;
	   corner2Point.header.frame_id = "camera_frame";
	   corner2Point.header.stamp = msg->header.stamp;
	   
	   geometry_msgs::PointStamped corner3Point;
	   corner3Point.point.x = corner3.x;
	   corner3Point.point.y = corner3.y;
	   corner3Point.header.frame_id = "camera_frame";
	   corner3Point.header.stamp = msg->header.stamp;

       geometry_msgs::PointStamped corner4Point;
	   corner4Point.point.x = corner4.x;
	   corner4Point.point.y = corner4.y;
	   corner4Point.header.frame_id = "camera_frame";
	   corner4Point.header.stamp = msg->header.stamp;
	   
	   pub2.publish(corner1Point);
	   pub2.publish(corner2Point);
	   pub2.publish(corner3Point);
	   pub2.publish(corner4Point);
	   
	   ROS_INFO("Published corner 1 position: (%f, %f)", corner1Point.point.x, corner1Point.point.y);
	   ros::Duration(1).sleep();
	   //repeat = false;
	   }
       //process_next_image = false;

	//cv::rectangle(grayscale, maxLocation, cv::Point(maxLocation.x + tempImage.cols, maxLocation.y + tempImage.rows), cv::Scalar(255, 255, 255), 2, 8, 0);
	//cv::rectangle(grayscale, cv::Point(roiRect.x, roiRect.y), cv::Point(roiRect.x +roiRect.width, roiRect.y +roiRect.height), cv::Scalar(255, 255, 255), 2, 8, 0);
	//create a window
	cv::namedWindow("nor_image", CV_WINDOW_NORMAL);
	//cv::namedWindow("edge image", CV_WINDOW_NORMAL);
	cv::namedWindow("phase", CV_WINDOW_NORMAL);
	cv::imshow("nor_image",grayscale);
	//cv::imshow("edge image",circleContour);
        cv::imshow("phase", cornerPosition);	
	cv::waitKey(30);

	//position
	//geometry_msgs::PointStamped centerPoint;
	//centerPoint.point.x = centerX;
	//centerPoint.point.y = centerY;
	//centerPoint.header.frame_id = "camera_frame";
	//centerPoint.header.stamp = msg->header.stamp;
	//pub2.publish(centerPoint);


        // Update cv_ptr image to the dilated image
        //cv_ptr->image = ookDemodulation;
        //cv_ptr->encoding = "mono8";


        // Output modified video stream
        
        //repeat = true;

	
              
  }
}
private:
    image_transport::ImageTransport it_;
    image_transport::Subscriber image_sub_;
    //image_transport::Publisher  image_pub_;
    ros::Publisher pub;
    ros::Publisher led_state_pub;
    //ros::Publisher vector_publisher;
    ros::Publisher pub2;
    std::vector<int> binary_data_;
    //bool repeat;
    std::vector<cv::Point> vertices;
    std::vector<cv::Mat> cornerPosition;
};

int main(int argc, char** argv) {
    ros::init(argc, argv, "image_converter");
    ros::NodeHandle nh;
    ImageProcessor ic(nh);
    //std::string binaryData = "010110";
    //std::string ookSignal = ookEncode(binaryData);
    //std::string preamble = "011110";
    //int maxLedId = 255;
    //int ledId = 42;

    //std::bitset<8> binaryLedId(ledId);
    //std::string dataPacket = preamble + binaryLedId.to_string();

    //std::cout << "Id : " << dataPacket << std::endl;
    //ros::Publisher led_state_pub;
    //led_state_pub = nh.advertise<vlp::LedBinary>("decoded_message", 1);
    ros::Rate rate(10);
    while(ros::ok()) {
           
	    ros::spinOnce();
            
	    rate.sleep();
    }

    ros::spin();
    return 0;
}
