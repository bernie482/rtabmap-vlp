#include <iostream>
#define M 2
#define N 3
#define P 2
using namespace std;
void MatrixMultiply(int arrA[M][N],int arrB[N][P],int arrC[M][P]);
void printMatrix(int matrix[M][P]) {
    for (int i = 0; i < M; i++) {
        for (int j = 0; j < P; j++) {
            cout << matrix[i][j] << " ";
        }
        cout << endl;
    }
}

int main()
{    
    int num1[M][N]={{33,45,67},
                   {23,71,56}};
    
    int num2[N][P]={{33,45},
                    {23,71},
                    {56,67}};
    int num3[M][P] = {0};
    MatrixMultiply(num1,num2,num3);
    
    cout << "µ²ªG¯x°} C:" << endl;
    printMatrix(num3);

    return 0;
}
void MatrixMultiply(int arrA[M][N], int arrB[N][P], int arrC[M][P]){
    for (int i=0; i < M ; i++){
        for ( int j=0; j < P ; j++){
            for (int k = 0 ; k < N; k++){
                arrC[i][j] = arrA[i][k] * arrB[k][j]; 
            }
        }
    }
}