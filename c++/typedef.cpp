#include <stdlib.h>
#include <stdio.h>
typedef struct  {
	char name[10];
	int math;	
}SCORE;
void display(SCORE);
int main(void){
	SCORE s1 = {"Jenny", 74};
	display(s1);
	
	system("pause");
	return 0;
}
void display (SCORE st){
	printf("�ǥͦW�r: %s\n",st.name);
	printf("�ƾǦ��Z: %d\n",st.math);
}
