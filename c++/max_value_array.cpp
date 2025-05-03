#include <stdio.h>
#include <stdlib.h>
int main (void){
	int a[5] = {2, 6, 10, 8, 7};
	int *ptr1, max, min;
	int index_max = 0;
	int index_min = 0;
	ptr1 = a;
	max = *ptr1;
	min = *ptr1;
	for (int i = 1; i < 5; i++){ 
	   //ptr1 = a + i;
		if (*(a + i) > max){
			max = *(a + i);
			index_max = i;
		}
		if (*(a + i) < min){
			min = *(a + i);
			index_min = i;
		}
		
	}
	
	printf ("\nmaximum index is = %d\n" , index_max);
	printf ("\n");
	
	printf ("\nminimum index is = %d\n" , index_min);
	printf ("\n");
	
	system ("pause");
	return 0;

}

