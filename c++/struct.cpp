#include <stdlib.h>
#include <stdio.h>
struct time {
	int hour;
	int minutes;
	double second;
}; 
struct date {
	int year;
	int month;
	int day;
	struct time today;
}now = {2024,10,9,{17,35,30}}; 
int main(void){
	printf("%d/%d/%d  %d:%d:%2.2f\n", now.year,now.month,now.day,now.today.hour,now.today.minutes,now.today.second);
	printf("%d¦ì¤¸²Õ\n",sizeof(now));
	printf("\n");
	system("pause");
	return 0;
}
