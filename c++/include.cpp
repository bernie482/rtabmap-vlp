#include<stdio.h>
#include<stdlib.h>
#include<area.h>
int main(void){
	float base, height;
	printf("請輸入三角形的底:");
	scanf("%f",&base);
	printf("請輸入三角形的高:");
	scanf("%f",&height);
	printf("三角形面積:%.2f\n",TRIANGLE(base,height));
	
	system("pause");
	return 0;
}
