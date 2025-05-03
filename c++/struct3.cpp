#include <stdlib.h>
#include <stdio.h>
struct data {
	char name[10];
	int math;	
}student[5] = {{"bernie", 90}, {"jack", 40}, {"mavis", 70}, {"bob", 55}, {"lily", 26}};
int main(void){
	for(int i = 0; i < 5; i++){
		if(student[i].math < 60){
			printf("%s = %d",student[i].name, student[i].math);
	        printf("\n");
		}
	}
	system("pause");
	return 0;
} 
