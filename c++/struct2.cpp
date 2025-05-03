#include <stdlib.h>
#include <stdio.h>
struct data {
	char name[10];
	int math;	
}student[5] = {{"bernie", 90}, {"jack", 60}, {"mavis", 70}, {"bob", 65}, {"lily", 86}};
int main(void){
	int index = 0;
	int max = student[0].math;
	for(int i = 1; i < 5; i++){
		if(student[i].math > max){
			max = student[i].math;
			index = i;
		}
	}
	printf("%s = %d",student[index].name, student[index].math);
	printf("\n");
	system("pause");
	return 0;
} 
