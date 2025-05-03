#include <stdio.h>
#include <stdlib.h>
void square(int *);
int main (void){
	int a[5] = {2, 4, 3, 10, 3};
	
	square(a);
	for( int i = 0 ; i < 5 ; i++){
	printf(" %3d" , a[i]);
	printf("\n");
   }
	
	system("pause");
	return 0 ;
	
}

void square(int *ptr)
{
	for(int i = 0; i < 5; i++){
	*(ptr + i) = *(ptr + i) * *(ptr + i);
   } 
}
