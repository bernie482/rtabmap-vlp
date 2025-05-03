#include <stdlib.h>
#include <stdio.h>
struct data {
	char name[10];
	int math;	
}student[5] = {{"bernie", 90}, {"jack", 40}, {"mavis", 70}, {"bob", 55}, {"lily", 26}};
void add5(struct data *);
int main(void){
	add5(student);
	for(int i = 0; i < 5; i++){
	printf("%s = %d",(student + i) -> name,(student + i) -> math);
	printf("\n");
	}
	system("pause");
	return 0;
} 
void add5(struct data *p1){
	for(int i = 0; i < 5; i++){
		(p1+i)-> math += 5;
	}
} 
