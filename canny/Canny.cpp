#include <opencv2/opencv.hpp>
#include <thread>
#include <mutex>
#include <unistd.h>

using namespace std
using namespace cv

void performCannyAndDisplay(const cv::Mat& inputImage, double lowThreshold, double highThreshold) {
    // Convert the image to grayscale
    cv::Mat grayImage;
    cv::cvtColor(inputImage, grayImage, cv::COLOR_BGR2GRAY);

    // Apply GaussianBlur to reduce noise and improve edge detection
    cv::GaussianBlur(grayImage, grayImage, cv::Size(5, 5), 0);

    // Apply Canny edge detection
    cv::Mat edges;
    cv::Canny(grayImage, edges, lowThreshold, highThreshold);

    // Display the Canny edges
    cv::imshow("Canny Edges", edges);
    cv::waitKey(0);
    cv::destroyAllWindows();
}

int main() {
    // Read the original image
    cv::Mat originalImage = cv::imread("image.jpg");

    // Perform Canny edge detection and display the result
    double lowThreshold = 50.0;
    double highThreshold = 150.0;
    performCannyAndDisplay(originalImage, lowThreshold, highThreshold); 

    return 0;
}
