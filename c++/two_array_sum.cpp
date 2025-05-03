#include  <stdio.h>
#include  <stdlib.h>
#define ROW 2
#define COL 3
void add(int A[ROW][COL], int B[ROW][COL], int C[ROW][COL]);
int main(void){
	int A[][COL] = {{1,1,2}, {2,3,3}};
	int B[][COL] = {{2,3,4}, {3,4,5}};
	int C[ROW][COL];
	
	add(A,B,C);
	for(int i = 0; i < ROW; i++)
   {
   	for(int j = 0; j < COL; j++)
   	   printf("%2d ", C[i][j]);
   	 printf("\n");
   }
   system("pause");
   return 0;
}
void add(int arr1[][COL], int arr2[][COL], int arr3[ROW][COL]){
	for(int i = 0; i < ROW; i++){
		for(int j = 0; j < COL; j++){
			arr3[i][j] = arr1[i][j] + arr2[i][j];
		}
	}
}
