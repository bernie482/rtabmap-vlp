#include <iostream>
using namespace std;

void Pascal_trangle(int n){
    int arr[n][n];

    for(int i=0; i<n; i++){
        for(int j=0; j < (n-i); j++){
        cout << " " ;
        }
        for (int j=0; j <= i; j++){
        
            if(j==0 | j==i){
            arr[i][j] = 1;
            }
            else{
                arr[i][j] = arr[i-1][j-1] + arr[i-1][j];
            }
            cout << arr[i][j] << " " ;
        }
        cout << endl;
    }
}


int main(void){
    int n;
    cin >> n;
    Pascal_trangle(n);
    system ("pause");
    return 0;
}